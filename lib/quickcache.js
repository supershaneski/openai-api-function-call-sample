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

function exist(storeKey, ...itemKeys) {

    const stores = {
        'weather': this.weather,
        'events': this.events,
        'event': this.event,
        'hotels': this.hotels,
        'hotel': this.hotel,
        'reservation': this.reservation,
    }

    return stores[storeKey].some((qc) => qc.key === itemKeys.join("_"))

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

    const stored_data = stores[storeKey].find((qc) => qc.key === itemKeys.join("_"))

    if(stored_data) {
        return JSON.parse(stored_data.value)
    }

}

const QuickCache = {
    weather,
    events,
    event,
    hotels,
    hotel,
    reservation,
    save,
    retrieve,
    exist,
}

export default QuickCache