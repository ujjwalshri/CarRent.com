angular.module('myApp').component('loadingComponent', {
    bindings: {
        isLoading: '<',
        loadingText: '@'  // Optional binding for custom loading text
    },
    template: `
        <style>
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                pointer-events: all;
            }

            .spinner-container {
                text-align: center;
                color: white;
                background-color: rgba(0, 0, 0, 0.5);
                padding: 20px 40px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            }

            .spinner {
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px auto;
            }

            .spinner-container p {
                margin: 0;
                font-size: 18px;
                font-weight: bold;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
        <div class="loading-overlay" ng-if="$ctrl.isLoading">
            <div class="spinner-container">
                <div class="spinner"></div>
                <p>{{$ctrl.loadingText || 'Loading...'}}</p>
            </div>
        </div>
    `
});
