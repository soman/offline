  var app = angular.module('offlineApp', ['ngRoute', 'ngMessages']);
  app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/register', {
                templateUrl: 'register.html',
                //controller: 'registerController'
            }).
            when('/partner', {
                templateUrl: 'partner.html',
                controller: 'partnerController'
            }).
            when('/financeCalculator', {
                templateUrl: 'finance_calculator.html',
                controller: 'financeController'
            }).
            when('/dashboard', {
                templateUrl: 'dashboard.html',
                controller: 'dashboardController'
            }).
            when('/confirmation', {
                templateUrl: 'confirmation.html',
                //controller: 'confirmationController'
            }).
            otherwise({
                templateUrl: 'register.html',
                controller: 'registerController'
            });
    }]);

  // Check internet connection
  app.run(function($window, $rootScope) {
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function() {
      $rootScope.$apply(function() {
        $rootScope.online = false;
      });
    }, false);

    $window.addEventListener("online", function() {
      $rootScope.$apply(function() {
        $rootScope.online = true;
      });
    }, false);
  });
  // End check internet connection

  app.controller('offlineController', function($scope, $location, $http) {

    $scope.isDisabled = true;

    $scope.regSubmit = function() {
      var partners_id_list = [];
      if(stInternetStaus == true){
        var current_user_id = this.user_id;
        localStorage.setItem("current_user_id", current_user_id);
        $http.get("/offline_app/sales_partner_list/"+current_user_id)
        .then(
              (function(current_user_id){
                return function(response) {
                  var partners =  response.data;
                  if(partners == ''){
                    var msg_element = angular.element( document.querySelector('.wrong-id') );
                    msg_element.addClass('ng-show');
                    msg_element.removeClass('ng-hide');
                    exit;
                  }
                  var partners_id_list = [];
                  for (item in partners) {
                    partners_id_list.push({
                        Id: parseInt(item),
                        pname: partners[item]
                    });

                    var single_partner = parseInt(item);
                    $http.get("/offline_app/partner/" + single_partner)
                    .then(
                      (function(single_partner){
                        return function(response) {
                          var storage_position = 'partner_' + single_partner;
                          localStorage.setItem(storage_position, JSON.stringify( response.data));
                        };
                      })(single_partner)
                    );
                  }

                  var partners_id_list = JSON.stringify(partners_id_list);
                  localStorage.setItem('partners_id_list', partners_id_list );
                };
              })(current_user_id)
        ).then(
            function successCallback(response) {
              window.location.href = '/offline/#/partner';
            }
        );
      }else{
        var current_user_id = localStorage.getItem("current_user_id");
        if(current_user_id != null){
          window.location.href = '/offline/#/partner';
        }else{
            var msg_element = angular.element( document.querySelector('.no-conn') );
            msg_element.addClass('ng-show');
            msg_element.removeClass('ng-hide');
        }
      }
    }; // End regSubmit

    $scope.partnerSubmit = function() {
      var current_partner_id = this.partner_id;
      localStorage.setItem("current_partner_id", current_partner_id);
      window.location.href = '/offline/#/financeCalculator';
    }; // End partnerSubmit

    $scope.calSubmit = function() {

      var finData = localStorage.getItem("finance_data");
      var finData = JSON.parse(finData);

      if(finData) {
        var keys = Object.keys(finData);
        number_of_data = keys.length;
        if(number_of_data == 0 ){
          localStorage.removeItem('finance_data');
        }
      }


        var financeAmount = this.financeAmount,
            dealType = this.dealType,
            firstName = this.firstName,
            lastName = this.lastName,
            phone = this.phone,
            email = this.email,
            current_month_rate = localStorage.getItem("current_month_rate"),
            current_month =  localStorage.getItem("current_month"),
            current_salesforce_id = localStorage.getItem("current_user_id"),
            partner_id = localStorage.getItem("current_partner_id");

      var timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
      var submission_id = partner_id +"-"+ timeStampInMs;

      var data = {
        "salesforce_id" : current_salesforce_id,
        "partner_id" : partner_id,
        "amount" : financeAmount,
        "dealType" : dealType,
        "aeffirestname" : firstName,
        "aeflastname" : lastName,
        "aefphone" : phone,
        "email_address" : email,
        "quote_text" : current_month_rate,
        "term" : current_month,
        "aefcompany": "",
        "source": "offline",
        "action": "",
        "submission_id": submission_id
      };

      if(typeof(Storage) !== "undefined") {
        var saved_data = localStorage.getItem("finance_data");

        if(saved_data) {
          saved_data = JSON.parse(saved_data);
        } else {
          var saved_data = [];
        }

        saved_data.push( data );
        //saved_data[partner_id] = data;

        var saved_data = JSON.stringify(saved_data);
        localStorage.setItem("finance_data", saved_data);

        var finData = localStorage.getItem("finance_data");

        finData = JSON.parse(finData);

        window.location.href = '/offline/#/confirmation';
      } else {
        console.log("Web Storage support not present");
      }
    }; // End calSubmit

    $scope.saveDataSubmit = function() {
      var saved_data = localStorage.getItem("finance_data");

      if(saved_data) {
        saved_data = JSON.parse(saved_data);

        angular.forEach(saved_data, function(value, key) {
          var path = '/offline_app/save/partner/data';
          var headers = {'Content-Type': 'application/json'};

          $http.post(path, value, headers).then(function(result) {
            if(result.status == 200) {
              var saved_data_orig = localStorage.getItem("finance_data");
              saved_data_orig = JSON.parse(saved_data_orig);

              if(saved_data_orig.length > 1) {
                console.log("loader loading...");
                var loaderElem = angular.element( document.querySelector('.loader'));
                loaderElem.removeClass('ng-hide');
                loaderElem.addClass('ng-show');
                console.log("loader loading complete");
              } else {
                var loaderElem = angular.element( document.querySelector('.loader'));
                loaderElem.removeClass('ng-show');
                loaderElem.addClass('ng-hide');
              }

              var submission_id = result["data"]["submission_id"];

              for(var i = 0; i < saved_data_orig.length; i++) {
                var obj = saved_data_orig[i];

                if(submission_id == obj.submission_id) {
                  saved_data_orig.splice(i, 1);
                  break;
                }
              }

              var mesg_html = "You have "+saved_data_orig.length+" data to save.";

              var update_total_data_msg = angular.element( document.querySelector(".show_total_no_data") );
              update_total_data_msg.html(mesg_html);

              var saved_data_orig = JSON.stringify(saved_data_orig);
              localStorage.setItem("finance_data", saved_data_orig);

            }
          }).then(function successCallback(response) {

            });
        });



      }

   }; // End saveDataSubmit

  });

  app.controller('financeController', function($scope, $location, $http, $compile) {

    var current_user_id = localStorage.getItem("current_user_id");
    var current_partner_id = localStorage.getItem("current_partner_id");
    var current_partner_info_id =  'partner_' + current_partner_id;

    var current_prtner_info = localStorage.getItem(current_partner_info_id);
    var current_prtner_info = JSON.parse(current_prtner_info);

    $scope.current_prtner_info = current_prtner_info;
    var terms_allowed = current_prtner_info['terms_allowed'];
    var term_html = '';
    for (term in terms_allowed){
      term_html = term_html + '<div id="box_'+term+'" ng-click="chosenMonthRate('+term+')" class="pack pack-wrap-'+term+'"><span class="months">' + term + ' MONTHS</span><div id="month_rate_'+ term +'" class="amount">$0</div></div>' ;
    }

    var month_rate_elem = angular.element( document.querySelector( '.form_right' ) );
    //month_rate_elem.append(term_html);
    month_rate_elem.append($compile(term_html)($scope));

    var current_deal_options = current_prtner_info['deal_options'];

    var deal_types = [];
    for(deal in current_deal_options ){
      deal_types.push({
        Id: deal,
        Type_name:current_deal_options[deal]
      })
    }

    $scope.deal_types = deal_types;


    var box_element = angular.element( document.querySelectorAll('.active') );
    if(box_element.length == 0){
      localStorage.setItem("current_month",null);
    }

    // Start Main Calculator

      $scope.chosenMonthRate = function(id) {
        var box_id = 'box_'+id;
        var box_element = angular.element( document.querySelectorAll('.pack') );
        for(var i=0; i< box_element.length; i++) {
          var myEl = angular.element(box_element[i]);
          myEl.removeClass('active');
        }
        var bx_element = angular.element( document.querySelector('#'+box_id) );
        bx_element.addClass('active');
        var bx_rate = 'month_rate_' + id;
        var month_rate = document.querySelector('#'+bx_rate).innerHTML;

        localStorage.setItem("current_month_rate",month_rate);
        localStorage.setItem("current_month",id);

        $scope.mainCalculator();
      }

      $scope.mainCalculator = function() {

        var current_partner_id = localStorage.getItem("current_partner_id");
        var selected_month = localStorage.getItem("current_month");
        var curdata = localStorage.getItem("partner_"+current_partner_id);
        var partnerData = JSON.parse(curdata);

        var dealValue = $scope.dealType;
        var financeAmount = $scope.financeAmount;

        if(typeof dealValue !== "undefined" && typeof financeAmount !== "undefined" && selected_month != null ) {
          $scope.isDisabled = false;
        }



        var rate = partnerData.rate[dealValue];
        //var inputAmount = parseFloat( financeAmount.replace(/\$|\,/g, '') );
        var inputAmount = financeAmount;

        //if( inputAmount > 0 ) $aefAmount.val(inputAmount.formatMoney(0, '$')); // NOTE for input amout format
        var min = 0;
        var max = 0;

        if(inputAmount <= partnerData.finance_minimum || inputAmount >= partnerData.finance_maximum || typeof inputAmount == "undefined"){
          var frangeElem = angular.element( document.querySelector( '.frange' ) );
          frangeElem.removeClass('ng-hide');
          frangeElem.addClass('ng-show');
        }else{
          var frangeElem = angular.element( document.querySelector( '.frange' ) );
           frangeElem.removeClass('ng-show');
           frangeElem.addClass('ng-hide');
        }



        if (inputAmount >= partnerData.finance_minimum && inputAmount <= partnerData.finance_maximum) {

          var applicableRateIndex = -1;
          if(rate) {
            for (var i = 0; i < rate.length; i++) {
              if (inputAmount >= rate[i].payment_minimum && inputAmount <= rate[i].payment_maximum) {
                applicableRateIndex = i;
                break;
              }
            }
          }

          if (applicableRateIndex >= 0) {
            var applicableRateObj = rate[applicableRateIndex];

            angular.forEach(applicableRateObj.rates, function(val, key){
              var hideElem = angular.element( document.querySelector( '.pack-wrap-'+key ) );

              if(val.rate <= 0) {
                hideElem.removeClass('ng-show');
                hideElem.addClass('ng-hide');
              } else {
                hideElem.removeClass('ng-hide');
                hideElem.addClass('ng-show');

                var ratePercent = val.rate / 100;
                var residue = (val.residue / 100 ) * inputAmount;
                var spread = 1 + parseFloat(applicableRateObj.spread) / 100;
                var pmt_rate = ratePercent / 12;
                var pmt = PMT(pmt_rate, key, inputAmount, -residue, 1); // PMT(rate, nper, pv, fv, 0) - PMT(0.14/12, 24, 75000, 0, 0)
                min = Math.round(pmt);
                var quote_text = min.formatMoney(0, '$');
                if( !partnerData.disable_spread ) {
                  max = Math.round(pmt * spread);
                  quote_text += ' - ' + max.formatMoney(0, '$');
                }

                var month_rate_up_elem = angular.element( document.querySelector("#month_rate_"+key) );
                month_rate_up_elem.html(quote_text);
              } // end ifelse
            });

          }
        }
      }

    // End Main Calculator

  });


  app.controller('registerController', function($scope, $location, $http) {
    $scope.$watch('online', function(internetStatus) {
      window.stInternetStaus = internetStatus;
    });
  });

  app.controller('partnerController', function($scope, $location, $http) {
     var sett_partners = localStorage.getItem("partners_id_list");
     $scope.sett_partners = JSON.parse(sett_partners);
  });

  app.controller('dashboardController', function($scope, $location, $http) {
      var finData = localStorage.getItem("finance_data");
      var finData = JSON.parse(finData);

      if(finData) {
        var keys = Object.keys(finData);
        $scope.number_of_data = keys.length;
      }
  });






