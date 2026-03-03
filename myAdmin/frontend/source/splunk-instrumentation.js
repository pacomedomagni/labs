import SplunkOtelWeb from '@splunk/otel-web';

const getRUMToken = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname.includes('prod')){
        return "J7Rbpu81vN3dL3iFy5ovyA";
    }
    else {
        return "nWl-1yE2gSGXF8V-FshlWg"; 
    }
  }
};

const getEnvironment = () => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    if (hostname.includes('local'))return 'LocalHost';
    if (hostname.includes('dev')) return 'Development';
    if (hostname.includes('test')) return 'Test';
    if (hostname.includes('qa')) return 'QA';
    if (hostname.includes('prod')) return 'Production'
  }
};



SplunkOtelWeb.init({
   beaconEndpoint: "https://rum-ingest.us1.signalfx.com/v1/rum",
   rumAccessToken: getRUMToken(),
   applicationName: "tmx-admin-app",
   deploymentEnvironment: getEnvironment(),
   sourceMapUploadEnabled: true,
});