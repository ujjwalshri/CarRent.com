angular.module("myApp").filter("carFilters", function() {
    return function (cars, search, priceFilter, categoryFilter, userCity) {
        if (!cars) return [];
        const priceRanges = { // Define price ranges for filtering
            "0-500": [0, 500],
            "500-1000": [500, 1000],
            "1000-1500": [1000, 1500],
            "1500-2000": [1500, 2000],
            "2000-2500": [2000, 2500],
            "2500-3000": [2500, 3000],
            "3000-3500": [3000, 3500],
            "3500-4000": [3500, 4000],
            "4000-4500": [4000, 4500],
            "4500-5000": [4500, 5000],
            "5000-5500": [5000, 5500],
            "5500-6000": [5500, 6000],
            "6000-6500": [6000, 6500],
            "6500-7000": [6500, 7000],
            "7000-7500": [7000, 7500],
            "7500-8000": [7500, 8000],
            "8000-8500": [8000, 8500],
            "8500-9000": [8500, 9000],
            "9000-9500": [9000, 9500],
            "9500-10000": [9500, 10000],
            "10000": [10000, Infinity]
        };

        return cars.filter(function (car) {
            // Check if the car matches the search, price, location, and category filters 
            let matchesSearch = !search || car.carName.toLowerCase().includes(search.toLowerCase()); // Check if the search string is included in the car name

            let matchesPrice = true; // Assume the car matches the price filter
            if (priceFilter) {
                let price = parseFloat(car.carPrice);
                if (priceRanges[priceFilter]) {
                    let [min, max] = priceRanges[priceFilter]; // Get the min and max prices for the selected range
                    matchesPrice = price >= min && price < max; // Check if the car price is within the selected range
                }
            }
            let matchesLocation = !userCity || car.owner.city === userCity;
            // Checking if the car location matches the selected location
            let matchesCategory = !categoryFilter || car.category === categoryFilter; // Checking if the car category matches the selected category

            return matchesSearch && matchesPrice && matchesCategory && matchesLocation; // Return true if all filters match
        });
    };
});