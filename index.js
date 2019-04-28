import React, { Component } from "react"
import ReactDOM from "react-dom"
import axios from "axios";
import './style.css'
import { feature } from "topojson-client"
import data from "./world.json";
import chroma from "chroma-js"
import tooltip from "wsdm-tooltip"
import { scaleLinear } from "d3-scale"


import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
  Markers,
  Marker
} from "react-simple-maps"
import get from 'axios'

const wrapperStyles = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
}

const colorScale = scaleLinear()
  //.domain([0,37843000])
  //.range([1,25])
  .range(['#ffff00', '#ffd820', '#ffae3d', '#f9844d', '#e95d51', '#d13747', '#b1142e', '#8b0000'])
  .domain([0, 10, 25, 50, 100, 300, 500, 700]);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { geographies: [], PG: true, data: [], max: 0, min: 0 ,zoom:1};
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)

    this.handleZoomIn = this.handleZoomIn.bind(this)
    this.handleZoomOut = this.handleZoomOut.bind(this)
  }
  handleZoomIn() {
    this.setState({
      zoom: this.state.zoom * 2,
    })
  }
  handleZoomOut() {
    this.setState({
      zoom: this.state.zoom / 2,
    })
  }
  loadchart() {
    const world = data;
    var maxval=0; var minval = 0;
    // Transform your paths with topojson however you want...
    let countries = feature(world, world.objects[Object.keys(world.objects)[0]]).features
    //console.log(this.state.data);
    
    countries.map((c, index) => {

      this.state.data.findIndex(x => {
        if (x.alpha2Code == c.properties.ISO_A2 ) {
          c.populationdensity = parseFloat((parseInt(x.population) / ((x.area) * 0.62)).toFixed(2));
          c.coordinates = x.latlng;
          c.gini = x.gini;
        }
      });

    });
    //console.log(countries);

console.log(maxval + '' + minval);
    this.setState({ geographies: countries, max: maxval, min: minval });

  }
  componentWillMount() {
    axios.get('https://restcountries.eu/rest/v2/all',
      {
        crossDomain: true,
        headers: { 'Content-Type': 'application/json' }
      }).then((response) => {
        //console.log(JSON.stringify(response.data));
        // console.log(JSON.stringify(response.data));
        this.setState({ data: response.data });
        localStorage.setItem('geo', JSON.stringify(response.data));
        this.loadchart();
      })
  }
  shouldComponentUpdate(nextProps) {
    const differentTitle = this.props.PG !== nextProps.PG;
    //const differentDone = this.props.done !== nextProps.done
    return !differentTitle;
  }
  handleOnclick(e) {
    let val = !this.state.PG;
    this.setState({ PG: val });
    //this.loadchart();

  }

  componentDidMount() {
    this.tip = tooltip()
    this.tip.create()
  }
  handleMouseMove(geography, evt) {

    if (this.state.PG) {
      this.tip.show(`
      <div class="tooltip-inner">
        ${geography.properties.NAME}'s Population Density -  ${geography.populationdensity} population/sqmiles</div> 
    `)
    }
    else {
      this.tip.show(`
 <div class="tooltip-inner">
        ${geography.properties.NAME}'s Gini -  ${geography.gini}
      </div>
      `)
    }

    this.tip.position({ pageX: evt.pageX, pageY: evt.pageY })
  }
  handleMouseLeave() {
    this.tip.hide()
  }
  render() {
    console.log(1);
    return (
      <div style={{ "marginTop": "10px", width: '100%', color: "red", "text-align": "center" }}>
        <div > <h3>{(this.state.PG ? 'Population Density ' : 'Gini Coefficient ') + " of the World in 2019 "}</h3></div>
        <div> source: https://restcountries.eu/rest/v2/all"</div>

        <input className="btn btn-primary" type="button" style={{ "marginTop": "10px" }} value={this.state.PG ? 'Get Gini' : 'Get Population D'} onClick={this.handleOnclick.bind(this)} />
<div className="row">
<div className="col-sm-4"></div>
 <a href="#">
          <span class="glyphicon glyphicon-zoom-out" onClick={ this.handleZoomOut }></span>
        </a>
        <a   href="#">
          <span class="glyphicon glyphicon-zoom-in" onClick={ this.handleZoomIn }></span>
        </a>
        </div>
       

        <ComposableMap style={{ "marginTop": "10px" }} >
          <ZoomableGroup zoom={ this.state.zoom }>
            <Geographies geography={this.state.geographies}>
              {(geographies, projection) => geographies.map((geography, i) => (
                <Geography
                  key={i}
                  geography={geography}
                  projection={projection}
                  onMouseMove={this.handleMouseMove}
                  onMouseLeave={this.handleMouseLeave}
                  style={{
                    default: {
                      fill: colorScale(geography.populationdensity),
                      stroke: "#607D8B",
                      strokeWidth: 0.75,
                      outline: "none",
                    },
                    hover: {
                      fill: '#b0cc00',
                      stroke: "#607D8B",
                      strokeWidth: 0.75,
                      outline: "none",
                    },
                    pressed: {
                      fill: '#b0cc00',
                      stroke: "#607D8B",
                      strokeWidth: 0.75,
                      outline: "none",
                    }
                  }}

                />
              ))}
            </Geographies>
            {/*<Markers>
              {this.state.geographies.map((marker, i) => (
               marker ?
                <Marker
                  key={i}
                  marker={marker}
                  style={{
                    default: { fill: "#FF5722" },
                    hover: { fill: "#FFFFFF" },
                    pressed: { fill: "#FF5722" },
                  }}
                  >
                  <circle
                    cx={0}
                    cy={0}
                    r={10}
                    style={{
                      stroke: "#FF5722",
                      strokeWidth: 3,
                      opacity: 0.9,
                    }}
                  />
                <text
                    textAnchor="middle"
                    y={-25}
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      fill: "#607D8B",
                    }}
                    >
                    {marker.populationdensity}
                    </text>
             
                </Marker> : null 
              ))}
            </Markers> */}
          </ZoomableGroup>
        </ComposableMap>

        <div className="gradient" >Low<div style={{ background: 'rgb(255, 255, 0' }}></div><div style={{ background: 'rgb(255, 216, 32' }}></div><div style={{ background: 'rgb(255, 174, 61' }}></div><div style={{ background: 'rgb(249, 132, 77' }}></div><div style={{ background: 'rgb(233, 93, 81' }}></div><div style={{ background: 'rgb(209, 55, 71' }}></div><div style={{ background: 'rgb(177, 20, 46' }}></div><div style={{ background: 'rgb(139, 0, 0' }}></div>High </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
