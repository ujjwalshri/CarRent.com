angular.module("myApp").component("dynamicNavbar", {
  template: `
    <nav class="navbar navbar-inverse" id="dynamicNavbar">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" ng-click="$ctrl.toggleNav()">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" ui-sref="home" ng-click="$ctrl.closeNav()">
                    <span class="glyphicon glyphicon-car"></span> Car.com
                </a>
            </div>
            <div class="navbar-collapse" uib-collapse="$ctrl.isNavCollapsed">
                <ul class="nav navbar-nav" id="navbarMainLinks">
                    <!-- Dynamically populated menu items will go here -->
                </ul>
                <ul class="nav navbar-nav navbar-right" id="navbarRightLinks">
                    <!-- Dynamically populated right menu items will go here -->
                </ul>
            </div>
        </div>
    </nav>
  `,
  controller: function($element, AuthService, ToastService, $compile, $scope, $rootScope, $state) {
    var ctrl = this;
    
    // Menu configurations for different user types
    const menuConfigs = {
      seller: {
        mainLinks: [
          { href: "sellerListings", icon: "glyphicon-list-alt", text: "My Listings" },
          { dropdown: true, icon: "glyphicon-calendar", text: "Bookings Management", items: [
            { href: "ownerBookings", icon: "glyphicon-tag", text: "Bidding Requests" },
            { href: "confirmedBookings", icon: "glyphicon-ok", text: "Confirmed Requests" }
          ]},
          { href: "sellerAnalytics", icon: "glyphicon-stats", text: "Seller Analytics" }
        ],
        rightLinks: [
          { href: "conversations({id: undefined})", icon: "glyphicon-comment", text: "Chats" },
          { href: "myProfile.overview", icon: "glyphicon-user", text: "Profile" },
        ]
      },
      user: {
        mainLinks: [],
        rightLinks: [
          { href: "conversations({id: undefined})", icon: "glyphicon-comment", text: "Chats" },
          { href: "becomeSeller", icon: "glyphicon-briefcase", text: "Become a Seller" },
          { href: "myProfile.overview", icon: "glyphicon-user", text: "Profile" },
        ]
      },
      public: {
        mainLinks: [],
        rightLinks: [
          { href: "login", icon: "glyphicon-log-in", text: "Login" }
        ]
      }
    };
    
    ctrl.$onInit = function() {
      ctrl.isNavCollapsed = true;
      ctrl.loadUserData();

      $rootScope.$on('admin:loggedOut', function() {
        ctrl.renderNavbar('public');
        $element.find('#dynamicNavbar').css('display', 'block');
      });
      
      $rootScope.$on('user:loggedIn', function() {
        ctrl.loadUserData();
      });
      
      $rootScope.$on('user:loggedOut', function() {
        ctrl.renderNavbar('public');
      });
    };
    
    ctrl.closeNav = function() {
      ctrl.isNavCollapsed = true;
    };

    ctrl.loadUserData = function() {
      AuthService.getLoggedinUser()
        .then(function(user) {
          if (user.isAdmin) {
            $element.find('#dynamicNavbar').css('display', 'none');
          } else {
            $element.find('#dynamicNavbar').css('display', 'block');
            const userType = user.isSeller ? 'seller' : 'user';
            ctrl.isSeller = user.isSeller;
            $scope.firstName = user.firstName;
            ctrl.renderNavbar(userType);
          }
        })
        .catch(function() {
          $element.find('#dynamicNavbar').css('display', 'block');
          ctrl.renderNavbar('public');
        });
    };
    
    ctrl.toggleNav = function() {
      ctrl.isNavCollapsed = !ctrl.isNavCollapsed;
    };
    
    ctrl.logout = function() {
      AuthService.logout()
        .then(function() {
          ToastService.success("Logged out successfully");
          ctrl.renderNavbar('public');
          $rootScope.$emit('user:loggedOut');
          $rootScope.isLogged = false;
          $state.go('login');
        })
        .catch(function(err) {
          ToastService.error("Error logging out");
        });
    };
    
    function createLinkElement(item) {
      let link;
      
      if (item.action === 'logout') {
        link = angular.element('<a href="#" ng-click="$ctrl.logout(); $ctrl.closeNav()"><span class="glyphicon ' + item.icon + '"></span> ' + item.text + '</a>');
      } else {
        link = angular.element('<a ui-sref="' + item.href + '" ng-click="$ctrl.closeNav()"><span class="glyphicon ' + item.icon + '"></span> ' + item.text + '</a>');
      }
      
      $compile(link)($scope);
      return link;
    }
    
    function createDropdown(item) {
      let dropdownContainer = angular.element('<li uib-dropdown class="dropdown"></li>');
      
      let toggle = angular.element(
        '<a href uib-dropdown-toggle class="dropdown-toggle" ng-click="$event.preventDefault()">' +
        '<span class="glyphicon ' + item.icon + '"></span> ' + item.text +
        ' <span class="caret"></span></a>'
      );
      
      let menu = angular.element('<ul uib-dropdown-menu class="dropdown-menu" role="menu"></ul>');
      
      item.items.forEach(function(subItem) {
        let li = angular.element('<li role="menuitem"></li>');
        let link = createLinkElement(subItem);
        li.append(link);
        menu.append(li);
      });
      
      dropdownContainer.append(toggle);
      dropdownContainer.append(menu);
      
      $compile(dropdownContainer)($scope);
      return dropdownContainer;
    }
    
    ctrl.renderNavbar = function(userType) {
      const config = menuConfigs[userType];
      
      const mainLinksContainer = $element.find('#navbarMainLinks');
      const rightLinksContainer = $element.find('#navbarRightLinks');
      
      mainLinksContainer.empty();
      rightLinksContainer.empty();
      
      config.mainLinks.forEach(function(item) {
        let element;
        
        if (item.dropdown) {
          element = createDropdown(item);
        } else {
          element = angular.element('<li></li>');
          let link = createLinkElement(item);
          element.append(link);
        }
        
        mainLinksContainer.append(element);
      });
      
      config.rightLinks.forEach(function(item) {
        let element = angular.element('<li></li>');
        let link = createLinkElement(item);
        element.append(link);
        rightLinksContainer.append(element);
      });
    };
  }
});