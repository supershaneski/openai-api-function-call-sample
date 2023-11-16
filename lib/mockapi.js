import { getUniqueId } from "./utils"

function getWeather({ location, date }) {

    if(!location) return { error: 'Invalid location', message: 'Please specify the location' }
    if(!date) return { error: 'Invalid date', message: 'Please specify the date' }

    const temperature = Math.floor(30 * Math.random())

    const conditions = ['Sunny', 'Cloudy', 'Rainy']
    const index = Math.floor(conditions.length * Math.random())

    return { location, date, temperature, unit: 'celsius', condition: conditions[index] }

}

function getEvents({ location, date }) {

    let chance = Math.round(15 * Math.random())

    if(chance === 13) {
        return { error: 'Unknown error', message: 'Failed to get events' }
    }

    if(!location) return { error: 'Invalid location', message: 'Please specify the location' }
    if(!date) return { error: 'Invalid date', message: 'Please specify the date' }

    const events = ['Outdoor Fiesta', 'Sumo Exhibition', 'Art Festival', 'Street Dance Parade', 'Farm Marche', 'Folk Concert', 'Soul Food Festival', 'Earth Day', 'Ramen Festival', 'Jazz Festival']
    const index = Math.floor(events.length * Math.random())

    return { location, date, event: events[index] }

}

function getEvent({ location, date, event }) {

    let chance = Math.round(15 * Math.random())

    if(chance === 13) {
        return { error: 'Unknown error', message: 'Failed to get event information' }
    }

    if(!location) return { error: 'Invalid location', message: 'Please specify the location' }
    if(!date) return { error: 'Invalid date', message: 'Please specify the date' }
    if(!event) return { error: 'Invalid event', message: 'Please specify the event name' }

    const times = ['10:00 - 18:00', '11:00 - 15:00', '13:00 - 18:00', '15:00 - 20:00', '18:00 - 22:00']
    chance = Math.floor(times.length * Math.random())
    const stime = times[chance]

    const places = ['People Hall', 'Community Center', 'City Stadium', 'City Park', 'River Park', 'United Stadium', 'Sports Center']
    chance = Math.floor(places.length * Math.random())
    const splace = places[chance]

    const event_id = getUniqueId()

    // Note: The images in the links are just placeholder but they exist.
    // If you want to use your own images or links, by experience, you need https and relative paths do not work.
    
    const links = [{ title: `Event site`, url: `https://example.com/event/${event_id}`, target: '_blank' }, { title: 'Venue information', url: `https://example.com/venue/${getUniqueId()}`, target: '_blank' }]

    chance = Math.floor(10 * Math.random())

    const images = [{ alt: event, src: chance > 5 ? 'https://i.postimg.cc/cH55BkC6/5592e301-0407-473a-ada0-e413f0791076.jpg' : 'https://i.postimg.cc/xCd4HV0W/614a6c2b-b881-42f2-a8d4-95f8033b55fb.jpg' }]
    
    return { location, date, event, time: stime, place: splace, links, images }

}

function searchHotel({ location }) {

    let chance = Math.round(15 * Math.random())

    if(chance === 13) {
        return { error: 'Unknown error', message: 'Failed to search for hotels' }
    }

    if(!location) return { error: 'Invalid location', message: 'Please specify the location' }

    chance = Math.round(10 * Math.random())
    if(chance === 8) {
        return { location, items: [], message: 'Found no hotels in the given location.' }
    }

    const prefixes = ["Supreme", "Great", "Grand", "Park", "Central", "Royal", "Century", "The", "Green", "Millenium", "Emerald"]
    const names = ["Sakura", "Garden", "River", "City", "View", "Onitsuka", "Falcon", "Lion", "Oak", "Southern", "Northern", "Eastern", "Western"]
    const suffixes = ["Hotel", "Inn", "Suites", "Lodge", "Guesthouse", "Hostel", "Mansion"]

    chance = 1 + Math.round(6 * Math.random())

    let items = []

    for(let i = 0; i < chance; i++) {

        const index1 = Math.floor(prefixes.length * Math.random())
        const index2 = Math.floor(names.length * Math.random())
        const index3 = Math.floor(suffixes.length * Math.random())
                
        items.push([prefixes[index1], names[index2], suffixes[index3]].join(' '))

    }

    return { location, items, message: `Found ${items.length} hotels` }

}

function getHotel({ location, hotel }) {
    let chance = Math.round(15 * Math.random())

    if(chance === 13) {
        return { error: 'Unknown error', message: 'Failed to get hotel information' }
    }

    if(!location) return { error: 'Invalid location', message: 'Please specify the location or branch' }
    if(!hotel) return { error: 'Invalid hotel name', message: 'Please specify the name of hotel' }

    chance = Math.round(10 * Math.random())
    if(chance === 8) {
        return { location, hotel, message: 'Hotel information not found' }
    }

    let description1 = `Welcome to ${hotel}, the epitome of luxury and comfort.\n` +
        `Nestled in the heart of the ${location}, our hotel offers a stunning view of the skyline.\n` +
        `Our rooms are designed with elegance and equipped with modern amenities to ensure a memorable stay.\n` +
        `Indulge in our world-class cuisine at our in-house restaurant, or unwind at our state-of-the-art fitness center and spa.\n` +
        `With our dedicated staff ready to cater to your needs 24/7, we guarantee an unparalleled hospitality experience at ${hotel}.\n` +
        `We look forward to welcoming you soon!`
    
    let description2 = `Escape the hustle and bustle of everyday life and immerse yourself in the tranquil ambiance of ${hotel}.\n` +
        `Nestled amidst the lush greenery of a secluded paradise, our hotel offers a sanctuary of relaxation and rejuvenation.\n` +
        `Our spacious and elegantly appointed rooms provide a haven of comfort, while our attentive staff is dedicated to ensuring your stay is nothing short of exceptional.`

    let description3 = `Nestled in the heart of ${location}, ${hotel} offers a blend of comfort and convenience.\n` +
        `Our hotel is designed with a touch of luxury and furnished with a bespoke blend of amenities to provide an unforgettable stay for our guests.\n` +
        `Our rooms are spacious and feature modern decor and amenities.\n` +
        `Some rooms also offer stunning city views!`
    
    let description4 = `Whether you’re visiting for business or leisure, ${hotel} is the perfect place to experience ${location} and its surroundings.\n` +
        `Book your stay with us for an unforgettable experience!`

    let descriptions = [description1, description2, description3, description4]

    chance = Math.floor(descriptions.length * Math.random())
    const description = descriptions[chance]
    
    const price = 3000 + Math.floor(20000 * Math.random())

    const list_of_amenities = ['pool', 'spa', 'sauna', 'fitness center', 'business center', 'free wifi', 'free breakfast']

    let amenities = []

    for(let amenity of list_of_amenities) {
        chance = Math.round(10 * Math.random())
        if(chance > 6) continue
        amenities.push(amenity)
    }

    // Note: The images in the links are just placeholder but they exist, for testing.
    // If you want to use your own images or links, by experience, you need https and relative paths do not work.
    
    const link_name = hotel.toLowerCase().split(' ').join('_')
    const website = `https://example.com/hotel/${link_name}/${getUniqueId()}`
    
    chance = Math.floor(10 * Math.random())
    const images = [{ alt: hotel, src: chance > 5 ? 'https://i.postimg.cc/jjc1LSrH/d5592424-e3f0-4dfa-afb2-2dcc7308e321.jpg' : 'https://i.postimg.cc/Xv4hjytN/dea57a4a-532b-43d2-85bb-0e0172d8c594.jpg' }]
    
    return { location, hotel, description, price: price.toLocaleString(), amenities, website, images }

}

function reserveHotel({ 
    hotel,
    location,
    fullName,
    numberOfGuests,
    checkInDate,
    checkOutDate,
    roomType,
    specialRequests
}) {
    let chance = Math.round(15 * Math.random())

    if(chance === 13) {
        return { error: 'Unknown error', message: 'Failed to make hotel reservation. Please try again.' }
    }

    if(!location) return { error: 'Invalid location', message: 'Please specify the location or branch' }
    if(!hotel) return { error: 'Invalid hotel name', message: 'Please specify the name of hotel' }
    if(!fullName) return { error: 'Invalid name', message: 'Please specify your full name' }
    if(!numberOfGuests) return { error: 'Invalid guest number', message: 'Please specify the number of guests' }
    if(!checkInDate) return { error: 'Invalid Check-In date', message: 'Please specify the Check-In date' }
    if(!checkOutDate) return { error: 'Invalid Check-out data', message: 'Please specify the Check-out date' }
    if(!roomType) return { error: 'Invalid room type', message: 'Please specify the room type' }
    
    if(fullName.toLowerCase().indexOf('full name') >= 0) {
        return { status: 'Invalid name', message: 'Please provide your full name', hotel, location, numberOfGuests, checkInDate, checkOutDate, roomType, specialRequests }
    }

    return {
        status: 'Reservation successful',
        reservationId: getUniqueId(),
        message: 'Your reservation has been completed. Please present your reservationId at the front desk.',
        hotel,
        location,
        fullName,
        numberOfGuests,
        checkInDate,
        checkOutDate,
        roomType,
        specialRequests
    }

}

export function callMockAPI( function_name, function_args ) {
    
    switch(function_name) {
        case 'get_weather':
            return getWeather(function_args)
        case 'get_events':
            return getEvents(function_args)
        case 'get_event':
            return getEvent(function_args)
        case 'search_hotel':
            return searchHotel(function_args)
        case 'get_hotel':
            return getHotel(function_args)
        case 'reserve_hotel':
            return reserveHotel(function_args)
        default:
            return { error: 'unknown function', message: 'function not found' }
    }

}