angular.module('myApp').component('paginationComponent', {
    bindings: {
        totalItems: '<',
        currentPage: '=',
        itemsPerPage: '<',
        onPageChange: '&'
    },
    template: `
        <div class="row margin-bottom-15" ng-show="$ctrl.totalItems > 0">
            <div class="col-xs-12 text-center">
                <ul uib-pagination 
                    boundary-links="true"
                    total-items="$ctrl.totalItems"
                    ng-model="$ctrl.currentPage"
                    ng-change="$ctrl.handlePageChange()"
                    items-per-page="$ctrl.itemsPerPage"
                    max-size="5"
                    class="pagination-sm"
                    previous-text="&lsaquo;"
                    next-text="&rsaquo;"
                    first-text="&laquo;"
                    last-text="&raquo;"
                    boundary-link-numbers="true">
                </ul>
            </div>
        </div>
    `,
    controller: function() {
        
        
        this.handlePageChange = () => {
            if (this.onPageChange) {
                this.onPageChange();
            }
        };
    }
});
