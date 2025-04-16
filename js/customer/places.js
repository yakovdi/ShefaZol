// places.js - Google Places API integration for address autocomplete
const placesModule = {
    autocomplete: null,
    placeDetails: null,
    
    // Initialize Google Places Autocomplete
    init: function() {
        const addressInput = document.getElementById('customerAddress');
        
        if (!addressInput) {
            console.error('Address input element not found');
            return;
        }
        
        // Initialize Google Places Autocomplete
        this.autocomplete = new google.maps.places.Autocomplete(addressInput, {
            componentRestrictions: { country: 'il' }, // Restrict to Israel
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            types: ['address']
        });
        
        // Add event listener for place selection
        this.autocomplete.addListener('place_changed', () => {
            this.placeDetails = this.autocomplete.getPlace();
            
            if (!this.placeDetails.geometry) {
                console.warn('No geometry found for selected place');
            }
        });
    },
    
    // Validate selected address
    validate: function() {
        if (!this.placeDetails) {
            alert('אנא בחר כתובת מהרשימה');
            return false;
        }
        
        return true;
    },
    
    // Get address data
    getAddressData: function() {
        return this.placeDetails;
    }
};

export default placesModule;
