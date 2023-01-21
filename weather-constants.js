export const CITIES = Object.freeze({
    rus: {
        'Murmansk': [68.970663, 33.074918],
        'St.-Petersburg': [59.938955, 30.315644],
        'Arkhangelsk': [64.539911, 40.515762],
        'Astrakhan': [46.347614, 48.030178],
        'Roschino': [60.256511, 29.603100],
        'Vladivostok': [43.115542, 131.885494],
        'Khabarovsk': [48.480229, 135.071917],
        'Nizhny Novgorod': [56.326797, 44.006516],
        'Krasnoyarsk': [56.010569, 92.852572],
        'Magadan': [59.565155, 150.808586],
        'Salekhard': [66.529903, 66.614544],
        'Moscow': [55.755864, 37.617698]
    },
    capitals: {
        'London (GBR)': [51.507351, -0.127696],
        'Tokyo (JPN)': [35.681729, 139.753927],
        'Paris (FRA)': [48.856663, 2.351556],
        'Rome (ITA)': [41.902695, 12.496176],
        'Washington (USA)': [35.551037, -77.058276],
        'Berlin (DEU)': [52.518621, 13.375142],
        'Buenos Aires (ARG)': [-34.615697, -58.435104],
        'Bangkok (THA)': [13.771370, 100.513782],
        'Cape Town (ZAF)': [-33.919785, 18.425596],
        'Wellington (NZL)': [-41.288741, 174.777075]
    },
    favourite: {
        'Valencia (ESP)': [39.464109, -0.375720],
        'Galway (IRL)': [53.276059, -9.050913],
        'Munich (DEU)': [48.137193, 11.575691],
        'Sofia (BGR)': [42.697839, 23.314498],
        'Budapest (HUN)': [47.492647, 19.051399],
        'Nicosia (CYP)': [35.172927, 33.353965],
        'Sydney (AUS)': [-33.865255, 151.216484],
        'Quebec (CAN)': [46.807102, -71.211788],
        'Seoul (KOR)': [37.570705, 126.976946]
    }
});
export const weatherLabels = {
    capitals: Object.keys(CITIES.capitals),
    rus: Object.keys(CITIES.rus),
    favourite: Object.keys(CITIES.favourite),
    average: []
};
export const weatherValues = {
    capitals: new Array(weatherLabels.capitals.length),
    rus: new Array(weatherLabels.rus.length),
    favourite: new Array(weatherLabels.favourite.length),
    average: []
};
