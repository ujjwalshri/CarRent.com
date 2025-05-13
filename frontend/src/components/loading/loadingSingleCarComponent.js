/**
 * Loading Single Car Component - Simplified
 * 
 * Displays a simple skeleton loading animation showing only the main structure
 * of the single car details page using only light gray shades
 */
angular.module('myApp').component('loadingSingleCarComponent', {
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
            
            .skeleton-shine {
                animation: shimmer 2s infinite linear;
                background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.03) 50%, rgba(0,0,0,0) 100%);
                background-size: 1000px 100%;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1;
            }
            
            .skeleton-element {
                background-color: #ececec;
                border-radius: 4px;
                position: relative;
                overflow: hidden;
            }

            .skeleton-container {
                padding: 20px 10px;
                background-color: #fcfcfc;
            }

            .skeleton-main-panel {
                border-radius: 8px;
                margin-bottom: 25px;
                background: white;
                overflow: hidden;
                box-shadow: 0 2px 5px rgba(0,0,0,0.03);
            }
            
            .skeleton-panel-heading {
                background-color: #d0d0d0;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                padding: 15px;
                position: relative;
            }
            
            .skeleton-car-image {
                height: 320px;
                background-color: #ececec;
                position: relative;
                margin-bottom: 15px;
            }

            .skeleton-car-details {
                background-color: #f8f8f8;
                border-radius: 4px;
                padding: 15px;
                margin-bottom: 15px;
                height: 200px;
                position: relative;
            }

            .skeleton-owner-panel {
                background-color: #f8f8f8;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 20px;
            }

            .skeleton-owner-heading {
                background-color: #d5d5d5;
                padding: 12px;
                height: 46px;
                position: relative;
            }

            .skeleton-owner-body {
                padding: 15px;
                height: 70px;
            }
            
            .skeleton-review-panel {
                background-color: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 5px rgba(0,0,0,0.03);
                margin-bottom: 20px;
            }
            
            .skeleton-review-heading {
                background-color: #d0d0d0;
                padding: 15px;
                position: relative;
            }
            
            .skeleton-review-body {
                padding: 15px;
                height: 200px;
                position: relative;
            }
        </style>
        
        <div class="skeleton-container container-fluid">
            <div class="row">
                <div class="col-md-12">
                    <!-- Main Car Panel -->
                    <div class="skeleton-main-panel">
                        <div class="skeleton-panel-heading">
                            <div class="skeleton-shine"></div>
                        </div>
                        
                        <div style="padding: 15px;">
                            <div class="row">
                                <!-- Left column - Car image -->
                                <div class="col-md-6">
                                    <div class="skeleton-car-image">
                                        <div class="skeleton-shine"></div>
                                    </div>
                                </div>
                                
                                <!-- Right column - Car details and owner info -->
                                <div class="col-md-6">
                                    <!-- Car Details -->
                                    <div class="skeleton-car-details">
                                        <div class="skeleton-shine"></div>
                                    </div>
                                    
                                    <!-- Owner Panel -->
                                    <div class="skeleton-owner-panel">
                                        <div class="skeleton-owner-heading">
                                            <div class="skeleton-shine"></div>
                                        </div>
                                        <div class="skeleton-owner-body">
                                            <div class="skeleton-shine"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reviews Panel - Basic structure -->
                    <div class="skeleton-review-panel">
                        <div class="skeleton-review-heading">
                            <div class="skeleton-shine"></div>
                        </div>
                        <div class="skeleton-review-body">
                            <div class="skeleton-shine"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
});