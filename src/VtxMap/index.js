import {default as VtxMap} from './Map';
import {default as VtxOptMap} from './optimizingPointMap';
import {default as VtxZoomMap} from './zoomMap';

VtxMap.VtxOptMap = VtxOptMap;
VtxMap.VtxZoomMap = VtxZoomMap;

export default VtxMap;
export {VtxMap,VtxOptMap,VtxZoomMap};