// __mocks__/react-native-maps.js
import React from 'react';

const MockMapView = ({ children }) => <>{children}</>;
MockMapView.displayName = 'MapView';

export const PROVIDER_GOOGLE = 'google';
export const Marker = ({ children }) => <>{children}</>;
export default MockMapView;
