import * as L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster';

interface ClusterOptions {
  maxClusterRadius?: number;
  spiderfyOnMaxZoom?: boolean;
  showCoverageOnHover?: boolean;
  zoomToBoundsOnClick?: boolean;
  disableClusteringAtZoom?: number;
}

const defaultOptions: ClusterOptions = {
  maxClusterRadius: 80,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: true,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
};

export function createClusterLayer(options: ClusterOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  
  return L.markerClusterGroup({
    maxClusterRadius: mergedOptions.maxClusterRadius,
    spiderfyOnMaxZoom: mergedOptions.spiderfyOnMaxZoom,
    showCoverageOnHover: mergedOptions.showCoverageOnHover,
    zoomToBoundsOnClick: mergedOptions.zoomToBoundsOnClick,
    disableClusteringAtZoom: mergedOptions.disableClusteringAtZoom,
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      let size = 'small';
      if (count > 100) size = 'large';
      else if (count > 20) size = 'medium';

      return L.divIcon({
        html: `<div class="cluster-${size}">${count}</div>`,
        className: `marker-cluster marker-cluster-${size}`,
        iconSize: L.point(40, 40)
      });
    }
  });
}

export type ClusterLayer = ReturnType<typeof createClusterLayer>;