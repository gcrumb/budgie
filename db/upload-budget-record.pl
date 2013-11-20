#!/usr/bin/perl -w

use strict;
use Data::Dumper;
use Store::CouchDB;
use File::Basename;

my $csv_file    = $ARGV[0] or die &usage();
my $budget_key  = $ARGV[1] or die &usage();
my $budget_name = $ARGV[2] or die &usage();

die "File '$csv_file' does not exist\n" unless -f $csv_file;
die "Cannot read file '$csv_file'\n" unless -r $csv_file;

my %upload_rec = ();

open CSV, $csv_file or die "Couldn't read file '$csv_file': $!\n";
my $first = 0;

$upload_rec{_id}  = $budget_key;
$root->{name} = $budget_name;

while (<CSV>){
  $first++;
  next if $first == 1;

  my ($country, $year, $type, $value, $sector, $dept, $programme, $name, $notes, $change, @etc) = split (/\,/, $_);
  chomp $change;

  # Top level data
  unless ($sector){

    my $root = $upload_rec{root} || {};

    $root->{data}->{$year}->{$type}  = $value;
    $root->{data}->{$year}->{change} = $change;
    $root->{data}=>{$year}->{notes}  .= "\n$notes";

    $upload_rec{root} = $root;
    next;
  }

  # Sectoral data
  unless ($dept){

    
    next;
  }

  # Departmental data
  unless ($programme){

    next;
  }

  # Programme data


}

#print Dumper($budget_data_in);

sub usage {
  my $command = basename($0);

  print <<EOM;
$0 usage:

    $0 /path/to/csv-file 'budget_key' 'budget name'

EOM

}
