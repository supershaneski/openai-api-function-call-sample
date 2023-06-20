export function callMockAPI({ location, date, operation }) {

    let data = {}

    for(let i = 0; i < operation.length; i++) {

        if(operation[i] === 'weather') {
            
            const temperature = 10 + Math.round(25 * Math.random())
            const chance = Math.round(10 * Math.random())
            data['weather'] = `${temperature} degrees celsius ${chance > 5 ? 'Sunny' : 'Cloudy'}`
        
        } else if(operation[i] === 'hotels') {
            
            const chance = Math.round(10 * Math.random())
            data['hotels'] = chance > 5 ? 'Park Hotel, Dormy Inn' : 'Century Plaza, Hilton Hotel'
        
        } else {
            
            if(location === 'tomorrow' || location.length === 0) {

                data['event'] = 'Invalid location.'

            } else {

                const chance = Math.round(10 * Math.random())
                data['event'] = chance > 5 ? 'Summer Festival, Odori Park, 13:00PM - 21:00PM' : 'Fireworks Festival, Toyohira River, 7:00PM to 8:30PM'
        
            }
            
        }

    }

    return data

}