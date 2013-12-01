#!/usr/bin/perl -w

use strict;
use Data::Dumper;
use Store::CouchDB;
use File::Basename;
use JSON;

my $csv_file    = $ARGV[0] or die &usage();
my $budget_key  = $ARGV[1] or die &usage();
my $budget_name = $ARGV[2] or die &usage();

die "File '$csv_file' does not exist\n" unless -f $csv_file;
die "Cannot read file '$csv_file'\n" unless -r $csv_file;

my %upload_rec = ();

open CSV, $csv_file or die "Couldn't read file '$csv_file': $!\n";
my $first = 0;

# Initialise the record
$upload_rec{_id}                 = $budget_key;
$upload_rec{root}->{name}        = $budget_name;
$upload_rec{level}               = 'National Expenditure';
$upload_rec{root}->{data}        = {};
$upload_rec{root}->{categories}  = {};

while (<CSV>){
  my ($country, $year, $type, $value, $sector, $dept, $programme, $name, $notes, $change, @etc) = split (/\,/, $_);

  # Check for column headings
  next if $year =~ /year/i;

  $sector    =~ s!\s+!!g;
  $dept      =~ s!\s+!!g;
  $programme =~ s!\s+!!g;
  $value     =~ s!\s+!!g;

  chomp $change if ($change && defined $change);

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
    $upload_rec{root}->{categories}                = $categories;

    next;
  }

  # Programme data
  die "Missing programme data from line '$_'!\n" unless (defined $programme && $programme);

  my $categories = $upload_rec{root}->{categories}                 || {};
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
  $upload_rec{root}->{categories}                 = $categories;

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

    $0 /path/to/csv-file 'budget_key' 'budget name'

EOM

}
