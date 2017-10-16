<?php
define('DRUPAL_ROOT', getcwd());

print DRUPAL_ROOT;


//require_once DRUPAL_ROOT . '/includes/bootstrap.inc';
require_once '/var/www/amur/includes/bootstrap.inc';
drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);

$data['partner_id'] = 297;
$data['email_address'] = "soman1@test.com";
$data['amount'] = 10001;
$data['term'] = 24;
$data['quote_text'] = "1-2";
$data['source'] = "";
$data['action'] = "";
$data['aeffirestname'] = "Soman1";
$data['aeflastname'] = "Sarker1";
$data['aefcompany'] = "ST1";
$data['aefphone'] = "111";

amur_widget_sales_dashboard_insert($data);

