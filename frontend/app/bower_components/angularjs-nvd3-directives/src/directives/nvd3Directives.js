/*
 Common functions that sets up width, height, margin
 should prevent NaN errors
 */
function initializeMargin(scope, attrs){
    'use strict';
    var margin = (scope.$eval(attrs.margin) || {left: 50, top: 50, bottom: 50, right: 50});
    if (typeof(margin) !== "object") {
        // we were passed a vanilla int, convert to full margin object
        margin = {left: margin, top: margin, bottom: margin, right: margin};
    }
    scope.margin = margin;
}

function initializeWidth(scope, attrs, element){
    'use strict';
    var marginAdjustment = 0;
    if(attrs.width === "undefined"){
        scope.width = element[0].parentElement.offsetWidth;
    } else {
        scope.width = (+attrs.width);
    }
    if(!scope.margin.left || !scope.margin.right){
        initializeMargin(scope, attrs, element);
    }
    marginAdjustment = (scope.margin.left + scope.margin.right);
    scope.width = (((scope.width - marginAdjustment) > 0) ? (scope.width - marginAdjustment) : 0);
}

function initializeHeight(scope, attrs, element){
    'use strict';
    var marginAdjustment = 0;
    if(attrs.height === "undefined"){
        scope.height = element[0].parentElement.offsetHeight;
    } else {
        scope.height = (+attrs.height);
    }
    if(!scope.margin.top || !scope.margin.bottom){
        initializeMargin(scope, attrs, element);
    }
    marginAdjustment = (scope.margin.top + scope.margin.bottom);
    scope.height = (((scope.height - marginAdjustment) > 0) ? (scope.height - marginAdjustment) : 0);
}

function setupDimensions(scope, attrs, element) {
    'use strict';
    initializeWidth(scope, attrs, element);
    initializeHeight(scope, attrs, element);
}

angular.module('nvd3ChartDirectives', [])
    .directive('nvd3LineChart', [function(){
        'use strict';
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlegend: '@',
                tooltips: '@',
                showxaxis: '@',
                showyaxis: '@',
                rightalignyaxis: '@',
                defaultstate: '@',
                nodata: '@',
                margin: '&',
                tooltipcontent: '&',
                color: '&',
                x: '&',
                y: '&',
                forcex: '@',
                forcey: '@',
                isArea: '@',
                interactive: '@',
                clipedge: '@',
                clipvoronoi: '@',
                interpolate: '@',

                //xaxis
                xaxisorient: '&',
                xaxisticks: '@',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',  //$watch(watchExpression, listener, objectEquality)

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.lineChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .forceX(attrs.forcex === undefined ? [] : scope.$eval(attrs.forcex)) // List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
                                    .forceY(attrs.forcey === undefined ? [0] : scope.$eval(attrs.forcey)) // List of numbers to Force into the Y scale
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .showXAxis(attrs.showxaxis === undefined ? false : (attrs.showxaxis  === "true"))
                                    .showYAxis(attrs.showyaxis === undefined ? false : (attrs.showyaxis  === "true"))
                                    .rightAlignYAxis(attrs.rightalignyaxis === undefined ? false : (attrs.rightalignyaxis  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .interactive(attrs.interactive === undefined ? false : (attrs.interactive === "true"))
                                    .clipEdge(attrs.clipedge === undefined ? false : (attrs.clipedge === "true"))
                                    .clipVoronoi(attrs.clipvoronoi === undefined ? false : (attrs.clipvoronoi === "true"))
                                    .interpolate(attrs.interpolate === undefined ? 'linear' : attrs.interpolate)
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color())
                                    .isArea(attrs.isarea === undefined ? function(){return false;} : function(){ return (attrs.isarea === "true"); });

                                if (chart.useInteractiveGuideline) {
                                    chart.useInteractiveGuideline(attrs.useinteractiveguideline === undefined ? false : (attrs.useinteractiveguideline === "true"));
                                }

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);
                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3CumulativeLineChart', [function(){
        'use strict';
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlegend: '@',
                tooltips: '@',
                showxaxis: '@',
                showyaxis: '@',
                rightalignyaxis: '@',
                defaultstate: '@',
                nodata: '@',
                margin: '&',
                tooltipcontent: '&',
                color: '&',
                x: '&',
                y: '&',
                forcex: '@',
                forcey: '@',
                isArea: '@',
                interactive: '@',
                clipedge: '@',
                clipvoronoi: '@',
                usevoronoi: '@',
                average: '&',
                rescaley: '@',

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',  //$watch(watchExpression, listener, objectEquality)

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.cumulativeLineChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .forceX(attrs.forcex === undefined ? [] : scope.$eval(attrs.forcex)) // List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
                                    .forceY(attrs.forcey === undefined ? [0] : scope.$eval(attrs.forcey)) // List of numbers to Force into the Y scale
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .showXAxis(attrs.showxaxis === undefined ? false : (attrs.showxaxis  === "true"))
                                    .showYAxis(attrs.showyaxis === undefined ? false : (attrs.showyaxis  === "true"))
                                    .rightAlignYAxis(attrs.rightalignyaxis === undefined ? false : (attrs.rightalignyaxis  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .interactive(attrs.interactive === undefined ? false : (attrs.interactive === "true"))
                                    .clipEdge(attrs.clipedge === undefined ? false : (attrs.clipedge === "true"))
                                    .clipVoronoi(attrs.clipvoronoi === undefined ? false : (attrs.clipvoronoi === "true"))
                                    .useVoronoi(attrs.usevoronoi === undefined ? false : (attrs.usevoronoi === "true"))
                                    .average(attrs.average === undefined ? function(d) { return d.average; } : scope.average())
                                    .color(attrs.color === undefined ? d3.scale.category10().range() : scope.color())
                                    .isArea(attrs.isarea === undefined ? false : (attrs.isarea === "true"));
                                    //.rescaleY(attrs.rescaley === undefined ? false : (attrs.rescaley === "true"));

                                if (chart.useInteractiveGuideline) {
                                    chart.useInteractiveGuideline(attrs.useinteractiveguideline === undefined ? false : (attrs.useinteractiveguideline === "true"));
                                }

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);
                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3StackedAreaChart', [function(){
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlegend: '@',
                tooltips: '@',
                showcontrols: '@',
                nodata: '@',
                margin: '&',
                tooltipcontent: '&',
                color: '&',
                x: '&',
                y: '&',
                forcex: '@', //List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
                forcey: '@', // List of numbers to Force into the Y scale
                forcesize: '@', // List of numbers to Force into the Size scale

                interactive: '@',
                usevoronoi: '@',
                clipedge: '@',
                interpolate: '@',
                style: '@',     //stack, stream, stream-center, expand
                order: '@',     //default, inside-out
                offset: '@',    //zero, wiggle, silhouette, expand
                size: '&',      //accessor to get the point size
                xScale: '&',
                yScale: '&',
                xDomain: '&',
                yDomain: '&',
                xRange: '&',
                yRange: '&',
                sizeDomain: '&',

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.stackedAreaChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .forceX(attrs.forcex === undefined ? [] : scope.$eval(attrs.forcex)) // List of numbers to Force into the X scale (ie. 0, or a max / min, etc.)
                                    .forceY(attrs.forcey === undefined ? [0] : scope.$eval(attrs.forcey)) // List of numbers to Force into the Y scale
                                    .size(attrs.size === undefined ? function(d) { return d.size || 1; } : scope.size())
                                    .forceSize(attrs.forcesize === undefined ? [] : scope.$eval(attrs.forcesize)) // List of numbers to Force into the Size scale
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .showControls(attrs.showcontrols === undefined ? false : (attrs.showcontrols === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .interactive(attrs.interactive === undefined ? false : (attrs.interactive === "true"))
                                    .clipEdge(attrs.clipedge === undefined ? false : (attrs.clipedge === "true"))
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color());

                                if (chart.useInteractiveGuideline) {
                                    chart.useInteractiveGuideline(attrs.useinteractiveguideline === undefined ? false : (attrs.useinteractiveguideline === "true"));
                                }

                                if(attrs.usevoronoi){
                                    chart.useVoronoi((attrs.usevoronoi === "true"));
                                }

                                if(attrs.style){
                                    chart.style(attrs.style);
                                }

                                if(attrs.order){
                                    chart.order(attrs.order);
                                }

                                if(attrs.offset){
                                    chart.offset(attrs.offset);
                                }

                                if(attrs.interpolate){
                                    chart.interpolate(attrs.interpolate);
                                }

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                if(attrs.xscale){
                                    chart.xScale(scope.xscale());
                                }

                                if(attrs.yscale){
                                    chart.yScale(scope.yscale());
                                }

                                if(attrs.xdomain){
                                    chart.xDomain(scope.xdomain());
                                }

                                if(attrs.ydomain){
                                    chart.yDomain(scope.ydomain());
                                }

                                if(attrs.sizedomain){
                                    chart.sizeDomain(scope.sizedomain());
                                }

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);
                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3MultiBarChart', [function(){
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlegend: '@',
                tooltips: '@',
                tooltipcontent: '&',
                color: '&',
                showcontrols: '@',
                nodata: '@',
                reducexticks: '@',
                staggerlabels: '@',
                rotatelabels: '@',
                margin: '&',
                x: '&',
                y: '&',
                //forcex is not exposed in the nvd3 multibar.js file.  it is not here on purpose.
                forcey: '@',
                delay: '@',
                stacked: '@',

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.multiBarChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .forceY(attrs.forcey === undefined ? [0] : scope.$eval(attrs.forcey)) // List of numbers to Force into the Y scale
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .showControls(attrs.showcontrols === undefined ? false : (attrs.showcontrols === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .reduceXTicks(attrs.reducexticks === undefined ? false: (attrs.reducexticks === "true"))
                                    .staggerLabels(attrs.staggerlabels === undefined ? false : (attrs.staggerlabels === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .rotateLabels(attrs.rotatelabels === undefined ? 0 : attrs.rotatelabels)
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color())
                                    .delay(attrs.delay === undefined ? 1200 : attrs.delay)
                                    .stacked(attrs.stacked === undefined ? false : (attrs.stacked === "true"));

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);
                                processEvents(chart, scope);

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3DiscreteBarChart', [function(){
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                tooltips: '@',
                tooltipcontent: '&',
                staggerlabels: '@',
                color: '&',
                margin: '&',
                nodata: '@',
                x: '&',
                y: '&',
                //forcex is not exposed in the nvd3 multibar.js file.  it is not here on purpose.
                forcey: '@',
                showvalues: '@',
                valueformat: '&',

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.discreteBarChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .forceY(attrs.forcey === undefined ? [0] : scope.$eval(attrs.forcey)) // List of numbers to Force into the Y scale
                                    .showValues(attrs.showvalues === undefined ? false : (attrs.showvalues === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .staggerLabels(attrs.staggerlabels === undefined ? false : (attrs.staggerlabels === "true"))
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color());

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                if(attrs.valueformat){
                                    chart.valueFormat(scope.valueformat());
                                }

                                //events
                                //https://github.com/mbostock/d3/wiki/Internals#wiki-dispatch
                                //dispatch: 'tooltipShow', 'tooltipHide', 'beforeUpdate',
                                //discretebar.dispatch: 'elementMouseout.tooltip', 'elementMouseover.tooltip'

                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3HistoricalBarChart', [function(){
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                tooltips: '@',
                tooltipcontent: '&',
                color: '&',
                margin: '&',
                nodata: '@',
                x: '&',
                y: '&',
//                forcex: '@',
                forcey: '@',
                isarea: '@',
                interactive: '@',
                clipedge: '@',
                clipvoronoi: '@',
                interpolate: '@',
                highlightPoint: '@',
                clearHighlights: '@',

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.historicalBarChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .forceY(attrs.forcey === undefined ? [0] : scope.$eval(attrs.forcey)) // List of numbers to Force into the Y scale
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .interactive(attrs.interactive === undefined ? false : (attrs.interactive === "true"))
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color());

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);

                                if (chart.useInteractiveGuideline) {
                                    chart.useInteractiveGuideline(attrs.useinteractiveguideline === undefined ? false : (attrs.useinteractiveguideline === "true"));
                                }

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                if(attrs.valueformat){
                                    chart.valueFormat(scope.valueformat());
                                }

                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3MultiBarHorizontalChart', [function(){
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlegend: '@',
                tooltips: '@',
                tooltipcontent: '&',
                color: '&',
                showcontrols: '@',
                margin: '&',
                nodata: '@',
                x: '&',
                y: '&',
                //forcex: '@',  //forcex is rebound from multibarhorizontalchart, but is not on multibar
                forcey: '@',
                stacked: '@',
                showvalues: '@',
                valueformat: '&',
                //'xDomain', 'yDomain',
                //state: '@', //stacked, grouped: same as stacked === true, or stacked === false

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.multiBarHorizontalChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .forceY(attrs.forcey === undefined ? [0] : scope.$eval(attrs.forcey))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color())
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .showControls(attrs.showcontrols === undefined ? false : (attrs.showcontrols === "true"))
                                    .showValues(attrs.showvalues === undefined ? false : (attrs.showvalues === "true"))
                                    .stacked(attrs.stacked === undefined ? false : (attrs.stacked === "true"));

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                if(attrs.valueformat){
                                    chart.valueFormat(scope.valueformat());
                                }

                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3PieChart', [function(){
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlabels: '@',
                showlegend: '@',
                donutLabelsOutside: '@',
                pieLabelsOutside: '@',
                labelType: '@',
                nodata: '@',
                margin: '&',
                x: '&',
                y: '&',
                color: '&',
                donut: '@',
                donutRatio: '@',
                labelThreshold: '@',
                description: '&',
                tooltips: '@',
                tooltipcontent: '&',
                valueFormat: '&',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.pieChart()
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .showLabels(attrs.showlabels === undefined ? false : (attrs.showlabels === "true"))
                                    .labelThreshold(attrs.labelThreshold === undefined ? 0.02 : attrs.labelthreshold)
                                    .labelType(attrs.labeltype === undefined ? 'key' : attrs.labeltype)
                                    .pieLabelsOutside(attrs.pielabelsoutside === undefined ? true : (attrs.pielabelsoutside === "true"))
                                    .valueFormat(attrs.valueformat === undefined ? d3.format(',.2f') : attrs.valueformat)
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .description(attrs.description === undefined ?  function(d) { return d.description; } : scope.description())
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color())
                                    .donutLabelsOutside(attrs.donutlabelsoutside === undefined ? false : (attrs.donutlabelsoutside === "true"))
                                    .donut(attrs.donut === undefined ? false : (attrs.donut === "true"))
                                    .donutRatio(attrs.donutratio === undefined ? 0.5 : (attrs.donutratio));

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }
                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3ScatterChart', [function(){
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlegend: '@',
                tooltips: '@',
                showcontrols: '@',
                showDistX: '@',
                showDistY: '@',
                rightAlignYAxis: '@',
                fisheye: '@',
                xPadding: '@',
                yPadding: '@',
                tooltipContent: '&',
                tooltipXContent: '&',
                tooltipYContent: '&',
                color: '&',
                margin: '&',
                nodata: '@',
                transitionDuration: '@',
                shape: '&',
                onlyCircles: '@',
                interactive: '@',
                x: '&',
                y: '&',
                size: '&',
                forceX: '@',
                forceY: '@',
                forceSize: '@',
                xrange: '&',
                xdomain: '&',
                xscale: '&',
                yrange: '&',
                ydomain: '&',
                yscale: '&',
                sizerange: '&',
                sizedomain: '&',
                zscale: '&',

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.scatterChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d.x; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d.y; } : scope.y())
                                    .size(attrs.size === undefined ? function(d){ return d.size; }: scope.size())
                                    .forceX(attrs.forcex === undefined ? [] : scope.$eval(attrs.forcex))
                                    .forceY(attrs.forcey === undefined ? [] : scope.$eval(attrs.forcey))
                                    .forceSize(attrs.forcesize === undefined ? [] : scope.$eval(attrs.forcesize))
                                    .interactive(attrs.interactive === undefined ? false : (attrs.interactive === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .tooltipContent(attrs.tooltipContent === undefined ? null : scope.tooltipContent())
                                    .tooltipXContent(attrs.tooltipxcontent === undefined ? function(key, x) { return '<strong>' + x + '</strong>'; } : scope.tooltipXContent())
                                    .tooltipYContent(attrs.tooltipycontent === undefined ? function(key, x, y) { return '<strong>' + y + '</strong>'; } : scope.tooltipYContent())
                                    .showControls(attrs.showcontrols === undefined ? false : (attrs.showcontrols === "true"))
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .showDistX(attrs.showdistx === undefined ? false : (attrs.showdistx === "true"))
                                    .showDistY(attrs.showdisty === undefined ? false : (attrs.showdisty === "true"))
                                    .xPadding(attrs.xpadding === undefined ? 0 : (+attrs.xpadding))
                                    .yPadding(attrs.ypadding === undefined ? 0 : (+attrs.ypadding))
                                    .fisheye(attrs.fisheye === undefined ? 0 : (+attrs.fisheye))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color())
                                    .transitionDuration(attrs.transitionduration === undefined ? 250 : (+attrs.transitionduration));

                                if(attrs.shape){
                                    chart.scatter.onlyCircles(false);
                                    chart.scatter.shape(attrs.shape === undefined ? function(d) { return d.shape || 'circle'; } : scope.shape());
                                }

//'pointActive', 'clipVoronoi', 'clipRadius', 'useVoronoi'

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);

                                if(attrs.xscale){
                                    chart.xDomain(scope.xdomain());
                                    chart.xRange(scope.xrange());
                                    chart.xScale(scope.xscale());
                                }

                                if(attrs.yscale){
                                    chart.yDomain(scope.ydomain());
                                    chart.yRange(scope.yrange());
                                    chart.yScale(scope.yscale());
                                }

                                if(attrs.zscale){
                                    chart.sizeDomain(scope.sizedomain());
                                    chart.sizeRange(scope.sizerange());
                                    chart.zScale(scope.zscale());
                                }

                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3ScatterPlusLineChart', [function(){
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@'
            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){

                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.scatterPlusLineChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d.x; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d.y; } : scope.y())
                                    .size(attrs.size === undefined ? function(d){ return d.size; }: scope.size())
                                    .interactive(attrs.interactive === undefined ? false : (attrs.interactive === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .tooltipContent(attrs.tooltipContent === undefined ? null : scope.tooltipContent())
                                    .tooltipXContent(attrs.tooltipxcontent === undefined ? function(key, x) { return '<strong>' + x + '</strong>'; } : scope.tooltipXContent())
                                    .tooltipYContent(attrs.tooltipycontent === undefined ? function(key, x, y) { return '<strong>' + y + '</strong>'; } : scope.tooltipYContent())
                                    .showControls(attrs.showcontrols === undefined ? false : (attrs.showcontrols === "true"))
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .showDistX(attrs.showdistx === undefined ? false : (attrs.showdistx === "true"))
                                    .showDistY(attrs.showdisty === undefined ? false : (attrs.showdisty === "true"))
                                    .xPadding(attrs.xpadding === undefined ? 0 : (+attrs.xpadding))
                                    .yPadding(attrs.ypadding === undefined ? 0 : (+attrs.ypadding))
                                    .fisheye(attrs.fisheye === undefined ? 0 : (+attrs.fisheye))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color())
                                    .transitionDuration(attrs.transitionduration === undefined ? 250 : (+attrs.transitionduration));

                                if(attrs.shape){
                                    chart.scatter.onlyCircles(false);
                                    chart.scatter.shape(attrs.shape === undefined ? function(d) { return d.shape || 'circle'; } : scope.shape());
                                }

                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                });
            }
        };
    }])
    .directive('nvd3LinePlusBarChart', [function(){
        'use strict';
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlegend: '@',
                tooltips: '@',
                showxaxis: '@',
                showyaxis: '@',
                rightalignyaxis: '@',
                defaultstate: '@',
                nodata: '@',
                margin: '&',
                tooltipcontent: '&',
                color: '&',
                x: '&',
                y: '&',
                clipvoronoi: '@',
                interpolate: '@',
//                'xScale', 'yScale', 'xDomain', 'yDomain', defined

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //yaxis
                y2axisorient: '&',
                y2axisticks: '&',
                y2axistickvalues: '&',
                y2axisticksubdivide: '&',
                y2axisticksize: '&',
                y2axistickpadding: '&',
                y2axistickformat: '&',
                y2axislabel: '&',
                y2axisscale: '&',
                y2axisdomain: '&',
                y2axisrange: '&',
                y2axisrangeband: '&',
                y2axisrangebands: '&',
                y2axisshowmaxmin: '@',
                y2axishighlightzero: '@',
                y2axisrotatelables: '@',
                y2axisrotateylabel: '@',
                y2axisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.linePlusBarChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .color(attrs.color === undefined ? nv.utils.defaultColor()  : scope.color());

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                configureXaxis(chart, scope, attrs);
                                configureY1axis(chart, scope, attrs);
                                configureY2axis(chart, scope, attrs);
                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3LineWithFocusChart', [function(){
        'use strict';
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                showlegend: '@',
                tooltips: '@',
                showxaxis: '@',
                showyaxis: '@',
                rightalignyaxis: '@',
                defaultstate: '@',
                nodata: '@',
                margin: '&',
                margin2: '&',
                tooltipcontent: '&',
                color: '&',
                x: '&',
                y: '&',
                clipvoronoi: '@',
                interpolate: '@',
                isArea: '@',
//                'xScale', 'yScale', 'xDomain', 'yDomain', defined

                //xaxis
                xaxisorient: '&',
                xaxisticks: '&',
                xaxistickvalues: '&xaxistickvalues',
                xaxisticksubdivide: '&',
                xaxisticksize: '&',
                xaxistickpadding: '&',
                xaxistickformat: '&',
                xaxislabel: '@',
                xaxisscale: '&',
                xaxisdomain: '&',
                xaxisrange: '&',
                xaxisrangeband: '&',
                xaxisrangebands: '&',
                xaxisshowmaxmin: '@',
                xaxishighlightzero: '@',
                xaxisrotatelables: '@',
                xaxisrotateylabel: '@',
                xaxisstaggerlabels: '@',

                //yaxis
                yaxisorient: '&',
                yaxisticks: '&',
                yaxistickvalues: '&yaxistickvalues',
                yaxisticksubdivide: '&',
                yaxisticksize: '&',
                yaxistickpadding: '&',
                yaxistickformat: '&',
                yaxislabel: '@',
                yaxisscale: '&',
                yaxisdomain: '&',
                yaxisrange: '&',
                yaxisrangeband: '&',
                yaxisrangebands: '&',
                yaxisshowmaxmin: '@',
                yaxishighlightzero: '@',
                yaxisrotatelables: '@',
                yaxisrotateylabel: '@',
                yaxisstaggerlabels: '@',

                //yaxis
                y2axisorient: '&',
                y2axisticks: '&',
                y2axistickvalues: '&',
                y2axisticksubdivide: '&',
                y2axisticksize: '&',
                y2axistickpadding: '&',
                y2axistickformat: '&',
                y2axislabel: '&',
                y2axisscale: '&',
                y2axisdomain: '&',
                y2axisrange: '&',
                y2axisrangeband: '&',
                y2axisrangebands: '&',
                y2axisshowmaxmin: '@',
                y2axishighlightzero: '@',
                y2axisrotatelables: '@',
                y2axisrotateylabel: '@',
                y2axisstaggerlabels: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);

                                //setup height 2
                                //height 2 is 100

                                //margin
                                //nvd3 default is {top: 30, right: 30, bottom: 30, left: 60}

                                //setup margin 2
                                //nvd3 default is {top: 0, right: 30, bottom: 20, left: 60}


                                var chart = nv.models.lineWithFocusChart()
                                    .width(scope.width)
                                    .height(scope.height)
//                                    .height2()
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d[0]; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d[1]; } : scope.y())
                                    .showLegend(attrs.showlegend === undefined ? false : (attrs.showlegend === "true"))
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata)
                                    .isArea(attrs.isarea === undefined ? function(){return false;} : function(){ return (attrs.isarea === "true"); });

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                configureXaxis(chart, scope, attrs);
                                configureY1axis(chart, scope, attrs);
                                configureY2axis(chart, scope, attrs);
                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3BulletChart', [function(){
        'use strict';
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                margin: '&',
                tooltips: '@',
                tooltipcontent: '&',
                orient: '@',  // left, right, top, bottom
                ranges: '&', //ranges (bad, satisfactory, good)
                markers: '&', // markers (previous, goal)
                measures: '&', // measures (actual, forecast)
                tickformat: '&',
                nodata: '@',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.bulletChart()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .orient(attrs.orient === undefined ? 'left' : attrs.orient)
//                                    .ranges(attrs.ranges === undefined ? function(d){ return d.ranges; } : scope.ranges())
//                                    .markers(attrs.markers === undefined ? function(d){ return d.markers; } : scope.markers())
//                                    .measures(attrs.measures === undefined ? function(d){ return d.measures; } : scope.measures())
                                    .tickFormat(attrs.tickformat === undefined ? null : scope.tickformat())
                                    .tooltips(attrs.tooltips === undefined ? false : (attrs.tooltips  === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata);

                                if(attrs.tooltipcontent){
                                    chart.tooltipContent(scope.tooltipcontent());
                                }

                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3SparklineChart', [function(){
        'use strict';
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                margin: '&',
                x: '&',
                y: '&',
                color: '&',
                xscale: '&',
                yscale: '&',
                showvalue: '@',
                alignvalue: '@',
                rightalignvalue: '@',
                nodata: '@',

                xaxistickformat: '&',
                yaxistickformat: '&',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                $scope.d3Call = function(data, chart){
                    d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data)
                        .transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                setupDimensions(scope, attrs, element);
                                var chart = nv.models.sparklinePlus()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(scope.margin)
                                    .x(attrs.x === undefined ? function(d){ return d.x; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d.y; } : scope.y())
                                    .color(attrs.color === undefined ? nv.utils.getColor(['#000']) : scope.color())
                                    .showValue(attrs.showvalue === undefined ? true : (attrs.showvalue === "true"))
                                    .alignValue(attrs.alignvalue === undefined ? true : (attrs.alignvalue === "true"))
                                    .rightAlignValue(attrs.rightalignvalue === undefined ? false : (attrs.rightalignvalue === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata);

                                if(attrs.xScale){
                                    chart.xScale(scope.xScale());
                                }

                                if(attrs.yScale){
                                    chart.yScale(scope.yScale());
                                }

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);
                                processEvents(chart, scope);
                                scope.d3Call(data, chart);
                                nv.utils.windowResize(chart.update);
                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }])
    .directive('nvd3SparklineWithBandlinesChart', [function(){
        'use strict';
        /**
         * http://www.perceptualedge.com/articles/visual_business_intelligence/introducing_bandlines.pdf
         * You need five primary facts about a set of time-series values to construct a bandline:
         * 1) the lowest value,
         * 2) the 25th percentile (i.e., the point at and below which the lowest 25% of the values reside),
         * 3) the median (a.k.a., the 50th percentile, the point at and below which 50% of the values reside),
         * 4) the 75th percentile (i.e., the point at and below which 75% of the values reside), and
         * 5) the highest value.
         */
        return {
            restrict: 'E',
            scope: {
                data: '=',
                width: '@',
                height: '@',
                id: '@',
                margin: '&',
                x: '&',
                y: '&',
                color: '&',
                xscale: '&',
                yscale: '&',
                showvalue: '@',
                alignvalue: '@',
                rightalignvalue: '@',
                nodata: '@',

                xaxistickformat: '&',
                yaxistickformat: '&',

                //angularjs specific
                objectequality: '@',

                //d3.js specific
                transitionduration: '@'

            },
            controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
                //expect scope to contain bandlineProperties
                $scope.d3Call = function(data, chart){
                    var selectedChart = d3.select('#' + $attrs.id + ' svg')
                        .attr('height', $scope.height)
                        .attr('width', $scope.width)
                        .datum(data);

                    //chart.yScale()($scope.bandlineProperties.median)
                    var sLineSelection = d3.select('svg#' + $attrs.id + ' g.nvd3.nv-wrap.nv-sparkline');
                    var bandlineData = [
                        $scope.bandlineProperties.min,
                        $scope.bandlineProperties.twentyFithPercentile,
                        $scope.bandlineProperties.median,
                        $scope.bandlineProperties.seventyFithPercentile,
                        $scope.bandlineProperties.max
                    ];
                    var bandLines = sLineSelection.selectAll('.nv-bandline').data([bandlineData]);
                        bandLines.enter().append('g')
                            .attr('class', 'nv-bandline');

                    selectedChart.transition().duration(($attrs.transitionduration === undefined ? 250 : (+$attrs.transitionduration)))
                        .call(chart);
                };
            }],
            link: function(scope, element, attrs){
                scope.$watch('data', function(data){
                    if(data){
                        //if the chart exists on the scope, do not call addGraph again, update data and call the chart.
                        if(scope.chart){
                            return scope.d3Call(data, scope.chart);
                        }
                        nv.addGraph({
                            generate: function(){
                                scope.bandlineProperties = {};
                                var sortedValues, margin = setupDimensions(scope, attrs, element);
                                var chart = nv.models.sparklinePlus()
                                    .width(scope.width)
                                    .height(scope.height)
                                    .margin(margin)
                                    .x(attrs.x === undefined ? function(d){ return d.x; } : scope.x())
                                    .y(attrs.y === undefined ? function(d){ return d.y; } : scope.y())
                                    .color(attrs.color === undefined ? nv.utils.getColor(['#000']) : scope.color())
                                    .showValue(attrs.showvalue === undefined ? true : (attrs.showvalue === "true"))
                                    .alignValue(attrs.alignvalue === undefined ? true : (attrs.alignvalue === "true"))
                                    .rightAlignValue(attrs.rightalignvalue === undefined ? false : (attrs.rightalignvalue === "true"))
                                    .noData(attrs.nodata === undefined ? 'No Data Available.' : scope.nodata);

                               //calc bandline data
                                scope.bandlineProperties.min = d3.min(data, function(d){ return d[1]; });
                                scope.bandlineProperties.max = d3.max(data, function(d){ return d[1]; });
                                sortedValues = data.map(function(d){
                                    return d[1];
                                }).sort(function(a, b){
                                    if(a[0] < b[0]){
                                        return -1;
                                    } else if (a[0] === b[0]){
                                        return 0;
                                    } else {
                                        return 1;
                                    }
                                });

                                scope.bandlineProperties.twentyFithPercentile = d3.quantile(sortedValues, 0.25);
                                scope.bandlineProperties.median = d3.median(sortedValues);
                                scope.bandlineProperties.seventyFithPercentile = d3.quantile(sortedValues, 0.75);

                                if(attrs.xScale){
                                    chart.xScale(scope.xScale());
                                }

                                if(attrs.yScale){
                                    chart.yScale(scope.yScale());
                                }

                                configureXaxis(chart, scope, attrs);
                                configureYaxis(chart, scope, attrs);
                                processEvents(chart, scope);

                                scope.d3Call(data, chart);

                                nv.utils.windowResize(chart.update);

                                scope.chart = chart;
                                return chart;
                            }
                        });
                    }
                }, (attrs.objectequality === undefined ? false : (attrs.objectequality === "true")));
            }
        };
    }]);

//still need to implement
//sparkbars??
//nv.models.multiBarTimeSeriesChart
//nv.models.multiChart
//nv.models.scatterPlusLineChart
//nv.models.linePlusBarWithFocusChart
//dual y-axis chart

//crossfilter using $services?
