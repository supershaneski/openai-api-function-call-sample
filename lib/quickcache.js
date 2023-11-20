const weather = []
const events = []
const event = []
const hotels = []
const hotel = []
const reservation = []

function save(storeKey, value, ...itemKeys) {
    
    const stores = {
        'weather': this.weather,
        'events': this.events,
        'event': this.event,
        'hotels': this.hotels,
        'hotel': this.hotel,
        'reservation': this.reservation,
    }

    const selected_store = stores[storeKey]

    selected_store.push({ key: itemKeys.join("_"), value: JSON.stringify(value) })

}

function retrieve(storeKey, ...itemKeys) {

    const stores = {
        'weather': this.weather,
        'events': this.events,
        'event': this.event,
        'hotels': this.hotels,
        'hotel': this.hotel,
        'reservation': this.reservation,
    }

    const selected_store = stores[storeKey]

    //

}

const QuickCache = {
    weather,
    events,
    event,
    hotels,
    hotel,
    reservation,
    save
}

export default QuickCache