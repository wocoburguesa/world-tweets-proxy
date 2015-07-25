var initialize = function () {
    var map = L.map('map').
        setView([39.50404070558415, -96.767578125], 4);
    var layer = L.tileLayer(
        'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '',
            maxZoom: 18
        }
    ).addTo(map);

    loadStatestData(function (data) {
        var states;
        states = drawStatesData(data);
        for (var i = 0; i < states.length; i++) {
            states[i].addTo(map);
        }
    });
};

var loadStatestData = function (callback) {
    var query = 'SELECT st_asgeojson(wkb_geometry), ' +
        'stusps, name ' +
        'FROM dataset_15838 ' +
        "WHERE stusps NOT IN ('ID', 'MT', 'ND', 'VT', " +
        "'NH', 'ME', 'WV', 'SC', 'AR', 'KS', 'IA', 'SD', 'WY', " +
        "'PR', 'AK', 'DE', 'NJ')";
    $.get(
        'https://beta.amigocloud.com/api/v1/users/24/projects/985/' +
            'sql?query=' + query + '&limit=50&offset=0' +
            '&token=R:xZJAwMLpp78iBpxjRXw0yYoU51v6sEcrTkbrun',
        function (data) {
            callback(data);
        }
    );
};

var drawStatesData = function (data) {
    var statesData = data.data,
      states = [];

    for (var i = 0; i < statesData.length; i++) {
        states.push(
            L.geoJson(
                JSON.parse(statesData[i].st_asgeojson),
                {
                    onEachFeature: function (feature, layer) {
                        feature.name = statesData[i].name
                        feature.code = statesData[i].stusps

                        layer.bindPopup(
                            '<div id="active-popup">' +
                                '<h3 class="title"></h3>' +
                                '<div class="content"></div>' +
                                '</div>',
                            {
                                closeButton: false,
                                minWidth: 200
                            }
                        );

                        layer.on('click', layerClickCallback);
                    },
                    style: {
                        weight: 1,
                        color: '#0084b4',
                        fillOpacity: 0.5,
                        fillColor: '#bfe0ec'
                    }
                }
            )
        );
    }
    return states;
};

var layerClickCallback = function (e, d) {
    var popup = $('#active-popup'),
    popupTitle = $($('#active-popup .title')[0]),
    popupContent = $($('#active-popup .content')[0]),
    loadingOverlay = $('<div><i class="fa fa-2x fa-spinner fa-spin"></i></div>'),
    stateCode = e.target.feature.geometry.code,
    cityButtons;

    popupTitle.html(e.target.feature.geometry.name);
    popupContent.append(loadingOverlay);

    $.ajax({
        method: 'GET',
        url: 'https://world-tweets-proxy.herokuapp.com/places_detail?place=' +
            e.target.feature.geometry.code,
    }).done(function (data) {
        var listElement = $('<ul class="buttons-list"></ul>');
        popupContent.append(listElement);
        loadingOverlay.remove();

        data = JSON.parse(data);

        if (data.length > 1) {
            cityButtons = [];
            for (var i = 0; i < data.length; i++) {
                cityButtons.push(
                    $('<li><button class="city-button" data-woeid="' +
                      data[i].woeid + '" data-name="' +
                      data[i].name + '">' +
                      data[i].name +
                      '</button></li>')
                );
                cityButtons[i].woeid = data[i].woeid;
                cityButtons[i].click(function (e, d) {
                    listElement.remove();
                    removeElements(cityButtons);
                    popupContent.append(loadingOverlay);
                    loadTrendsForPlace(e.target.dataset.woeid).
                        done(function (trendsData) {
                            popupContent.append(listElement);
                            trendsData = JSON.parse(trendsData)[0].trends;
                            for (var i = 0; i < trendsData.length; i++) {
                                listElement.append(
                                    buildTrendElement(trendsData[i])
                                );
                            }

                            popupTitle.html(e.target.dataset.name + ', ' + stateCode);
                        }).fail(function (error) {
                        }).always(function () {
                            loadingOverlay.remove();
                        });
                });
                listElement.append(cityButtons[i]);
            }
        } else {
            loadTrendsForPlace(data[0].woeid).
                done(function (trendsData) {
                    popupContent.append(listElement);
                    trendsData = JSON.parse(trendsData)[0].trends;
                    for (var i = 0; i < trendsData.length; i++) {
                        listElement.append(
                            buildTrendElement(trendsData[i])
                        );
                    }
                    popupTitle.html(data[0].name + ', ' + stateCode);
                }).fail(function (error) {
                }).always(function () {
                    loadingOverlay.remove();
                });

        }
    });
};

var removeElements = function (array) {
    for (var i = 0; i < array.length; i++) {
        array[i].remove();
    }
};

var loadTrendsForPlace = function (woeid) {
    return $.ajax({
        method: 'GET',
        url: 'https://world-tweets-proxy.herokuapp.com/places_proxy?place=' +
            woeid,
    });
};

var buildTrendElement = function (trendData) {
    return $(
        '<li><div class="trending-item">' +
            '<a href="' + trendData.url +'" target="_blank">' +
            trendData.name + '</a>' +
            '</div></li>'
    );
};
