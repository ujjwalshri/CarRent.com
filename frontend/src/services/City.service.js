angular.module("myApp").service("City", function($http) {
    /*
    function to fetch all the cities
    @params none
    @returns promise
    */
    this.getCities = function() {
        return [
            "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
            "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat", 
            "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", 
            "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", 
            "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", 
            "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar", 
            "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", 
            "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", 
            "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", 
            "Guwahati", "Chandigarh", "Solapur", "Hubballi-Dharwad", "Bareilly", 
            "Mysore", "Tiruchirappalli", "Tiruppur", "Gurgaon", "Aligarh", 
            "Jalandhar", "Bhubaneswar", "Salem", "Mira-Bhayandar", "Warangal", 
            "Thiruvananthapuram", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur", 
            "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai", 
            "Cuttack", "Firozabad", "Kochi", "Bhavnagar", "Dehradun", 
            "Durgapur", "Asansol", "Nanded", "Kolhapur", "Ajmer", 
            "Gandhinagar", "Ujjain", "Siliguri", "Jhansi", "Ulhasnagar", 
            "Jammu", "Sangli", "Mangalore", "Erode", "Belgaum", 
            "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Udaipur", 
            "Kakinada", "Davangere", "Kozhikode", "Maheshtala", "Rajpur Sonarpur", 
            "Bokaro", "South Dumdum", "Bellary", "Patiala", "Gopalpur"
        ].sort();
    };
    this.getIndianCitiesAndLongitudeMap = function(){
        return  {
            "Mumbai": { lat: 19.0760, lng: 72.8777 },
            "Delhi": { lat: 28.7041, lng: 77.1025 },
            "Bangalore": { lat: 12.9716, lng: 77.5946 },
            "Hyderabad": { lat: 17.3850, lng: 78.4867 },
            "Chennai": { lat: 13.0827, lng: 80.2707 },
            "Kolkata": { lat: 22.5726, lng: 88.3639 },
            "Pune": { lat: 18.5204, lng: 73.8567 },
            "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
            "Jaipur": { lat: 26.9124, lng: 75.7873 },
            "Surat": { lat: 21.1702, lng: 72.8311 },
            "Lucknow": { lat: 26.8467, lng: 80.9462 },
            "Kanpur": { lat: 26.4499, lng: 80.3319 },
            "Nagpur": { lat: 21.1458, lng: 79.0882 },
            "Indore": { lat: 22.7196, lng: 75.8577 },
            "Thane": { lat: 19.2183, lng: 72.9781 },
            "Bhopal": { lat: 23.2599, lng: 77.4126 },
            "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
            "Patna": { lat: 25.5941, lng: 85.1376 },
            "Vadodara": { lat: 22.3072, lng: 73.1812 },
            "Ghaziabad": { lat: 28.6692, lng: 77.4538 },
            "Ludhiana": { lat: 30.9009, lng: 75.8573 },
            "Agra": { lat: 27.1767, lng: 78.0081 },
            "Nashik": { lat: 19.9975, lng: 73.7898 },
            "Faridabad": { lat: 28.4089, lng: 77.3178 },
            "Meerut": { lat: 28.9845, lng: 77.7064 },
            "Rajkot": { lat: 22.3039, lng: 70.8022 },
            "Varanasi": { lat: 25.3176, lng: 82.9739 },
            "Srinagar": { lat: 34.0837, lng: 74.7973 },
            "Aurangabad": { lat: 19.8762, lng: 75.3433 },
            "Dhanbad": { lat: 23.7957, lng: 86.4304 },
            "Amritsar": { lat: 31.6340, lng: 74.8723 },
            "Navi Mumbai": { lat: 19.0330, lng: 73.0297 },
            "Allahabad": { lat: 25.4358, lng: 81.8463 },
            "Ranchi": { lat: 23.3441, lng: 85.3096 },
            "Coimbatore": { lat: 11.0168, lng: 76.9558 },
            "Jabalpur": { lat: 23.1815, lng: 79.9864 },
            "Gwalior": { lat: 26.2183, lng: 78.1828 },
            "Vijayawada": { lat: 16.5062, lng: 80.6480 },
            "Jodhpur": { lat: 26.2389, lng: 73.0243 },
            "Madurai": { lat: 9.9252, lng: 78.1198 },
            "Raipur": { lat: 21.2514, lng: 81.6296 },
            "Kota": { lat: 25.2138, lng: 75.8648 },
            "Guwahati": { lat: 26.1445, lng: 91.7362 },
            "Chandigarh": { lat: 30.7333, lng: 76.7794 },
            "Bhubaneswar": { lat: 20.2961, lng: 85.8245 },
            "Salem": { lat: 11.6643, lng: 78.1460 },
            "Warangal": { lat: 17.9784, lng: 79.5910 },
            "Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
            "Guntur": { lat: 16.3067, lng: 80.4365 },
            "Noida": { lat: 28.5355, lng: 77.3910 },
            "Jamshedpur": { lat: 22.8046, lng: 86.2029 },
            "Bhilai": { lat: 21.1938, lng: 81.3509 },
            "Cuttack": { lat: 20.4625, lng: 85.8828 },
            "Kochi": { lat: 9.9312, lng: 76.2673 },
            "Dehradun": { lat: 30.3165, lng: 78.0322 },
            "Durgapur": { lat: 23.5204, lng: 87.3119 },
            "Asansol": { lat: 23.6739, lng: 86.9524 },
            "Nanded": { lat: 19.1383, lng: 77.3210 },
            "Kolhapur": { lat: 16.7050, lng: 74.2433 },
            "Ajmer": { lat: 26.4499, lng: 74.6399 },
            "Gandhinagar": { lat: 23.2156, lng: 72.6369 },
            "Ujjain": { lat: 23.1793, lng: 75.7849 },
            "Siliguri": { lat: 26.7271, lng: 88.3953 },
            "Jhansi": { lat: 25.4484, lng: 78.5685 },
            "Ulhasnagar": { lat: 19.2215, lng: 73.1645 },
            "Jammu": { lat: 32.7266, lng: 74.8570 },
            "Mangalore": { lat: 12.9716, lng: 74.8351 },
            "Erode": { lat: 11.3410, lng: 77.7172 },
            "Belgaum": { lat: 15.8497, lng: 74.4977 },
            "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
            "Malegaon": { lat: 20.5553, lng: 74.5346 },
            "Gaya": { lat: 24.7955, lng: 85.0002 },
            "Udaipur": { lat: 24.5854, lng: 73.7125 },
            "Kakinada": { lat: 16.9891, lng: 82.2475 },
            "Davangere": { lat: 14.4644, lng: 75.9210 },
            "Kozhikode": { lat: 11.2588, lng: 75.7804 },
            "Bokaro": { lat: 23.6693, lng: 86.1511 },
            "Bellary": { lat: 15.1394, lng: 76.9214 },
            "Patiala": { lat: 30.3398, lng: 76.3869 },
            "Shiv puri": { lat: 25.4021, lng: 77.7210 },
            "Bhind": { lat: 26.5752, lng: 78.5391 },
            "bhind": { lat: 26.5752, lng: 78.5391 },
            "Gurugram": { lat: 28.4595, lng: 77.0266 },
            "Aligarh": { lat: 27.8974, lng: 78.0880 },

        };
        
    }
})