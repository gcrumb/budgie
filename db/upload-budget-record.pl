#!/usr/bin/perl -w

use strict;
use Data::Dumper;
use Store::CouchDB;
use File::Basename;
use JSON;
use Getopt::Long;

my $csv_file             = '';
my $budget_key           = '';
my $budget_name          = '';
my $budget_currency      = '';
my $currency_multiplier  = 1;

my $result = GetOptions ("file=s"       => \$csv_file,
			 "key=s"        => \$budget_key,
			 "name=s"       => \$budget_name,
			 "currency=s"   => \$budget_currency,
			 "multiplier=i" => \$currency_multiplier,
			);

die usage() unless ($csv_file && $budget_key && $budget_name && $budget_currency);

die "File '$csv_file' does not exist\n" unless -f $csv_file;
die "Cannot read file '$csv_file'\n" unless -r $csv_file;

die "You must specify a currency.\n" unless $budget_currency;
die "Invalid currency multiplier: $currency_multiplier\n" unless $currency_multiplier >= 1;

my %upload_rec = ();

open CSV, $csv_file or die "Couldn't read file '$csv_file': $!\n";
my $first = 0;

# Initialise the record
$upload_rec{_id}                 = $budget_key;
$upload_rec{root}->{name}        = $budget_name;
$upload_rec{level}               = 'National Expenditure';
$upload_rec{root}->{data}        = {};
$upload_rec{root}->{currency}    = $budget_currency;
$upload_rec{root}->{multiplier}  = $currency_multiplier;
$upload_rec{root}->{categories}  = {};

while (<CSV>){
  my ($country, $year, $type, $value, $sector, $dept, $programme, $subprogramme, $name, $notes, $change, @etc) = split (/\,/, $_);

  next unless ($country && $year);
  # Check for column headings
  next if $year =~ /year/i;

  unless (defined $name && $name){
    $name = (defined $dept && $dept) ? $dept : $sector;
    chomp $name;
  }

  $sector    =~ s!\s+!!g;
  $dept      =~ s!\s+!!g;
  $programme =~ s!\s+!!g;
  $value     =~ s!\s+!!g;

  $value = $value ? $value : 0;
  $value += 0;

  # We're not using this for now....
  $change = '';
#  chomp $change if ($change && defined $change);
#  $change =~ s!\\r!!g;

  # Top level data
  unless ($sector){

    my $root = $upload_rec{root};
    $root->{data}->{$year}->{$type}  = $value ? $value : 0;
    $root->{data}->{$year}->{change} = $change ? $change : 0;
#    $root->{data}=>{$year}->{notes}  .= "\n$notes";

    $upload_rec{root} = $root;
    next;
  }

  # Sectoral data
  unless ($dept){

    die "Missing sector data from line '$_'!\n" unless (defined $sector && $sector);

    my $categories = $upload_rec{root}->{categories};
    my $sect       = $categories->{$sector} || {};

    $sect->{level}                   ="Sectoral Expenditure";
    $sect->{name}                    = $name;
    $sect->{data}->{$year}->{$type}  = $value ? $value : 0;
    $sect->{data}->{$year}->{change} = $change ? $change : 0;

    $categories->{$sector}             = $sect;
    $upload_rec{root}->{categories}            = $categories;

    next;
  }

  # Departmental data
  unless ($programme){

    die "Missing department data from line '$_'!\n" unless (defined $dept && $dept);

    my $categories = $upload_rec{root}->{categories}         || {};
    my $sect       = $categories->{$sector}          || {};
    my $department = $sect->{categories}->{$dept}    || {};

    $department->{level}                   ="Departmental Expenditure";
    $department->{name}                    = $name;
    $department->{data}->{$year}->{$type}  = $value ? $value : 0;
    $department->{data}->{$year}->{change} = $change ? $change : 0;

    $sect->{categories}->{$dept}           = $department;
    $categories->{$sector}                 = $sect;
    $upload_rec{root}->{categories}        = $categories;

    next;
  }

  # Programme data
  unless ($subprogramme){
    die "Missing programme data from line '$_'!\n" unless (defined $programme && $programme);
    
    my $categories = $upload_rec{root}->{categories}         || {};
    my $sect       = $categories->{$sector}                  || {};
    my $department = $sect->{categories}->{$dept}            || {};
    my $prog       = $department->{categories}->{$programme} || {};

    $prog->{level}                          = 'Programme Expenditure';
    $prog->{name}                           = $name;
    $prog->{data}->{$year}->{$type}         = $value ? $value : 0;
    $prog->{data}->{$year}->{change}        = $change ? $change : 0;

    $department->{categories}->{$programme} = $prog;
    $sect->{categories}->{$dept}            = $department;
    $categories->{$sector}                  = $sect;
    $upload_rec{root}->{categories}         = $categories;

    next;
  }

  die "Missing subprogramme data from line '$_'!\n" unless (defined $subprogramme && $subprogramme);

  my $categories = $upload_rec{root}->{categories}              || {};
  my $sect       = $categories->{$sector}                       || {};
  my $department = $sect->{categories}->{$dept}                 || {};
  my $prog       = $department->{categories}->{$programme}      || {};
  my $subprog    = $prog->{categories}->{$subprogramme}         || {};

  $subprog->{level}                          = 'Subprogramme Expenditure';
  $subprog->{name}                           = $name;
  $subprog->{data}->{$year}->{$type}         = $value ? $value : 0;
  $subprog->{data}->{$year}->{change}        = $change ? $change : 0;

  $prog->{categories}->{$subprogramme}       = $subprog;
  $department->{categories}->{$programme}    = $prog;
  $sect->{categories}->{$dept}               = $department;
  $categories->{$sector}                     = $sect;
  $upload_rec{root}->{categories}            = $categories;

}

# Need to recurse through the entire object, inserting each category's percentage of the parent total.
my $category_list = $upload_rec{root}->{categories};
foreach my $cat (keys %$category_list){
	$upload_rec{'root'}->{'categories'}->{$cat} = get_percentages($upload_rec{'root'}->{'data'}, $upload_rec{'root'}->{'categories'}->{$cat});
}

sub get_percentages{

	my $parent = shift or return;
	my $child  = shift or return;

	if (exists $child->{categories}){
		my $category_list = $child->{categories};
		foreach my $cat (keys %$category_list){
			$child->{'categories'}->{$cat} = get_percentages($child->{'data'}, $child->{'categories'}->{$cat});
		}
	}

	my $data = $child->{data};
	foreach my $year (keys %$data){
		if (exists $parent->{$year}->{aggr} && $parent->{$year}->{aggr} && $child->{data}->{$year}->{aggr} != 0 ){
			$child->{'data'}->{$year}->{percentage} = sprintf("%.2f", ($child->{data}->{$year}->{aggr} / $parent->{$year}->{aggr}) * 100) + 0;
		}
		else {
			$child->{'data'}->{$year}->{percentage} = 0;
		}
	}

	return $child;
}

print to_json(\%upload_rec);

sub get_notes {

  # This is going to be a separate process, in which we pull an arbitrary number of notes
  # from a separate file based on either the sectoral, departmental or programme key.

  my $key = shift or return "";

  return "Notes go here";

}

sub usage {
  my $command = basename($0);

  print <<EOM;
$0 usage:

    $0 --file|f csv_file --key|k budget_key --name|n  budget_name \\
       --currency|c budget_currency \\
       [--multiplier|m currency_multiplier]

EOM

}
