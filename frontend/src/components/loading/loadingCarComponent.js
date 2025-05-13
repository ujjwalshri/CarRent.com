/**
 * Loading Car Component
 * 
 * Displays skeleton loading animations for car listings
 * Creates a modern, pleasant loading experience while waiting for car data
 */
angular.module('myApp').component('loadingCarComponent', {
    bindings: {
        count: '<',  // Number of skeleton cards to display (defaults to 6)
        columns: '@' // Bootstrap column classes (defaults to 'col-md-4 col-sm-6')
    },
    controller: function() {
        var ctrl = this;
        
        // Default values
        ctrl.$onInit = function() {
            ctrl.count = ctrl.count || 6;
            ctrl.columns = ctrl.columns || 'col-md-4 col-sm-6';
            // Create array with specified count for ng-repeat
            ctrl.skeletons = new Array(parseInt(ctrl.count));
        };
    },
    template: `
        <style>
            @keyframes shimmer {
                0% {
                    background-position: -1000px 0;
                }
                100% {
                    background-position: 1000px 0;
                }
            }
            
            .skeleton-car {
                border-radius: 8px;
                overflow: hidden;
                height: 600px;
                margin-bottom: 20px;
                background: #f8f9fa;
                position: relative;
            }
            
            .skeleton-shine {
                animation: shimmer 2s infinite linear;
                background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
                background-size: 1000px 100%;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1;
            }
            
            .skeleton-img {
                height: 220px;
                background-color: #e0e0e0;
            }
            
            .skeleton-body {
                padding: 15px;
            }
            
            .skeleton-title {
                height: 22px;
                background-color: #e0e0e0;
                width: 80%;
                margin-bottom: 15px;
                border-radius: 4px;
            }
            
            .skeleton-subtitle {
                height: 15px;
                background-color: #e0e0e0;
                width: 60%;
                margin-bottom: 20px;
                border-radius: 4px;
            }
            
            .skeleton-price {
                height: 24px;
                background-color: #e0e0e0;
                width: 50%;
                margin-bottom: 15px;
                border-radius: 4px;
            }
            
            .skeleton-tag {
                height: 20px;
                background-color: #e0e0e0;
                width: 30%;
                float: right;
                border-radius: 4px;
            }
            
            .skeleton-divider {
                height: 1px;
                background-color: #e8e8e8;
                margin: 15px 0;
            }
            
            .skeleton-spec {
                height: 60px;
                background-color: #e8e8e8;
                border-radius: 4px;
                margin-bottom: 10px;
            }
            
            .skeleton-spec-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .skeleton-footer {
                background-color: #e8e8e8;
                height: 60px;
                border-radius: 4px;
                margin-top: auto;
            }
            
            /* Responsive adjustments */
            @media (max-width: 767px) {
                .skeleton-car {
                    height: 450px;
                }
                
                .skeleton-img {
                    height: 180px;
                }
            }
        </style>
        
        <div class="row">
            <div ng-class="$ctrl.columns" ng-repeat="i in $ctrl.skeletons track by $index">
                <div class="skeleton-car">
                    <div class="skeleton-shine"></div>
                    <div class="skeleton-img"></div>
                    <div class="skeleton-body">
                        <div class="skeleton-title"></div>
                        <div class="row">
                            <div class="col-xs-7">
                                <div class="skeleton-price"></div>
                            </div>
                            <div class="col-xs-5">
                                <div class="skeleton-tag"></div>
                            </div>
                        </div>
                        
                        <div class="skeleton-divider"></div>
                        
                        <div class="skeleton-spec-grid">
                            <div class="skeleton-spec"></div>
                            <div class="skeleton-spec"></div>
                            <div class="skeleton-spec"></div>
                            <div class="skeleton-spec"></div>
                        </div>
                        
                        <div class="skeleton-footer"></div>
                    </div>
                </div>
            </div>
        </div>
    `
});