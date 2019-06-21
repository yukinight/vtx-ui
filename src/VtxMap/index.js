import {default as VtxMap} from './Map';
import {default as VtxOptMap} from './optimizingPointMap';
import {default as VtxZoomMap} from './zoomMap';
import {default as MapPlayer} from './mapPlayer';

VtxMap.VtxOptMap = VtxOptMap;
VtxMap.VtxZoomMap = VtxZoomMap;
VtxMap.MapPlayer = MapPlayer;

export default VtxMap;
export {VtxMap,VtxOptMap,VtxZoomMap,MapPlayer};