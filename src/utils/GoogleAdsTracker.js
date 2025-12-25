import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GoogleAdsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-17814776719/lOdDCJ3UitQbEI_X365C' // 'AW-CONVERSION_ID/CONVERSION_LABEL'
      });
    }
  }, [location]);

  return null;
};

export default GoogleAdsTracker;
