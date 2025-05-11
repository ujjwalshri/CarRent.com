angular.module("myApp").component("dynamicNavbar", {
  template: `
    <nav class="navbar navbar-inverse" id="dynamicNavbar">
        <div class="container-fluid">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" ng-click="$ctrl.toggleNav()">
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" ui-sref="home" ng-click="$ctrl.closeNav()" >
                    <span class="glyphicon glyphicon-car"></span> Car.com
                </a>
               
            </div>
            <div class="collapse navbar-collapse" id="navbarItems" uib-collapse="$ctrl.isNavCollapsed">
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
  controller: function($element, AuthService, ToastService, $compile, $scope, AuthService, $rootScope, $state, $scope) {
    var ctrl = this;
    
    // Menu configurations for different user types
    const menuConfigs = {
      seller: {
        mainLinks: [
          { href: "sellerListings", icon: "glyphicon-list-alt", text: "My Listings" },
         
          { dropdown: true, icon: "glyphicon-calendar", text: "Bookings Management", items: [
            { href: "ownerBookings", icon: "glyphicon-tag", text: "Bidding Requests" },
            { href: "confirmedBookings", icon: "glyphicon-ok", text: "Confirmed Bookings" }
          ]},
          { href: "sellerAnalytics", icon: "glyphicon-stats", text: "Analytics" }
        ],
        rightLinks: [
          { href: "conversations({id: undefined})", icon: "glyphicon-comment", text: "Chats" },
          { href: "myProfile.overview", icon: "glyphicon-user", text:"Profile" },
          { action: "logout", icon: "glyphicon-log-out", text: "Logout" }
        ]
      },
      user: {
        mainLinks: [
     
         
        ],
        rightLinks: [
          { href: "conversations({id: undefined})", icon: "glyphicon-comment", text: "Chats" },
          { href: "becomeSeller", icon: "glyphicon-briefcase", text: "Become a host" },
          { href: "myProfile.overview", icon: "glyphicon-user", text: "Profile" },
          
          { action: "logout", icon: "glyphicon-log-out", text: "Logout" }
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
    
    // Close the navigation bar
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
        link = angular.element('<a href="#"><span class="glyphicon ' + item.icon + '"></span> ' + item.text + '</a>');
        link.on('click', function(e) {
          e.preventDefault();
          ctrl.logout();
          ctrl.closeNav();
        });
      } else {
        link = angular.element('<a ui-sref="' + item.href + '" ng-click="$ctrl.closeNav()"><span class="glyphicon ' + item.icon + '"></span> ' + item.text + '</a>');
        $compile(link)($scope);
      }
      
      return link;
    }
    
    function createDropdown(item) {
      let dropdown = angular.element(
        '<a href="#" class="dropdown-toggle" uib-dropdown-toggle>' +
        '<span class="glyphicon ' + item.icon + '"></span> ' + item.text +
        ' <span class="caret"></span></a>'
      );
      
      let dropdownMenu = angular.element('<ul class="dropdown-menu"></ul>');
      
      item.items.forEach(function(subItem) {
        let li = angular.element('<li></li>');
        let link = createLinkElement(subItem);
        li.append(link);
        dropdownMenu.append(li);
      });
      
      let dropdownContainer = angular.element('<li class="dropdown" uib-dropdown></li>');
      dropdownContainer.append(dropdown);
      dropdownContainer.append(dropdownMenu);
      
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