/* Copyright (c) AerServ, 2015
 *
 * All rights reserved. The methods and
 * techniques described herein are considered trade secrets
 * and/or confidential. Reproduction or distribution, in whole
 * or in part, is forbidden except by express written permission
 * of AerServ.
 */

package com.aerserv.sdk.plugins.phonegap;

import org.apache.cordova.CordovaPlugin;
import android.util.Log;
import android.app.Activity;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.Object;
import java.lang.Override;
import java.lang.Throwable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import com.aerserv.sdk.AerServConfig;
import com.aerserv.sdk.AerServEvent;
import com.aerserv.sdk.AerServEventListener;
import com.aerserv.sdk.AerServInterstitial;
import com.aerserv.sdk.AerServVirtualCurrency;

public class AerServSDKPhoneGapPlugin extends CordovaPlugin {

    private static Activity activity;
    private static CallbackContext interstitialCallbackContextRef;
    private static CallbackContext bannerCallbackContextRef;
    private static ASAdViewWrapper banner;
    private static AerServInterstitial asInterstitial = null;

    private static HashMap<AerServEvent, String> callbackFunctionNameMap =
            new HashMap<AerServEvent, String>();

    static {
        callbackFunctionNameMap.put(AerServEvent.PRELOAD_READY, "onPreloadReadyCallback");
        callbackFunctionNameMap.put(AerServEvent.AD_LOADED, "onAdLoadedCallback");
        callbackFunctionNameMap.put(AerServEvent.AD_FAILED, "onAdFailedCallback");
        callbackFunctionNameMap.put(AerServEvent.AD_IMPRESSION, "onAdShownCallback");
        callbackFunctionNameMap.put(AerServEvent.AD_CLICKED, "onAdClickedCallback");
        callbackFunctionNameMap.put(AerServEvent.AD_DISMISSED, "onAdDismissedCallback");
        callbackFunctionNameMap.put(AerServEvent.VC_READY, "onVcReadyCallback");
        callbackFunctionNameMap.put(AerServEvent.VC_REWARDED, "onVcRewardedCallback");
    }

    private static AerServEventListener interstitialEventListener = new AerServEventListener() {
        @Override
        public void onAerServEvent(AerServEvent event, List<Object> eventArgs) {
            Log.d("AerServSDKPhoneGapPlugin", event.name());

            if (event == AerServEvent.AD_FAILED) {
                // Get error message, if there is one
                String message = "";
                if (eventArgs != null && eventArgs.size() > 0 && eventArgs.get(0) != null) {
                    message = eventArgs.get(0).toString();
                }

                sendPluginResult(interstitialCallbackContextRef, callbackFunctionNameMap.get(event),
                        PluginResult.Status.OK, message);
            } else if (event == AerServEvent.VC_READY || event == AerServEvent.VC_REWARDED) {
                // Get VC name and amount, if they are available
                String vcName = "";
                BigDecimal vcAmount = BigDecimal.ZERO;
                if (eventArgs != null
                        && eventArgs.size() > 0
                        && eventArgs.get(0) != null
                        && eventArgs.get(0) instanceof AerServVirtualCurrency) {
                    AerServVirtualCurrency vc = (AerServVirtualCurrency) eventArgs.get(0);
                    vcName = vc.getName();
                    vcAmount = vc.getAmount();
                }

                sendPluginResult(interstitialCallbackContextRef, callbackFunctionNameMap.get(event),
                        PluginResult.Status.OK, vcName, vcAmount);
            } else if (callbackFunctionNameMap.get(event) != null) {
                // No-argument event
                sendPluginResult(interstitialCallbackContextRef, callbackFunctionNameMap.get(event),
                        PluginResult.Status.OK);
            }
        }
    };

    private static AerServEventListener bannerEventListener = new AerServEventListener() {
        @Override
        public void onAerServEvent(AerServEvent event, List<Object> eventArgs) {
            Log.d("AerServSDKPhoneGapPlugin", event.name());

            if (event == AerServEvent.AD_FAILED) {
                // Get error message, if there is one
                String message = "";
                if (eventArgs != null && eventArgs.size() > 0 && eventArgs.get(0) != null) {
                    message = eventArgs.get(0).toString();
                }

                sendPluginResult(bannerCallbackContextRef, callbackFunctionNameMap.get(event),
                        PluginResult.Status.OK, message);
            } else if (event == AerServEvent.VC_READY || event == AerServEvent.VC_REWARDED) {
                // Get VC name and amount, if they are available
                String vcName = "";
                BigDecimal vcAmount = BigDecimal.ZERO;
                if (eventArgs != null
                        && eventArgs.size() > 0
                        && eventArgs.get(0) != null
                        && eventArgs.get(0) instanceof AerServVirtualCurrency) {
                    AerServVirtualCurrency vc = (AerServVirtualCurrency) eventArgs.get(0);
                    vcName = vc.getName();
                    vcAmount = vc.getAmount();
                }

                sendPluginResult(bannerCallbackContextRef, callbackFunctionNameMap.get(event),
                        PluginResult.Status.OK, vcName, vcAmount);
            } else if (callbackFunctionNameMap.get(event) != null) {
                // No-argument event
                sendPluginResult(bannerCallbackContextRef, callbackFunctionNameMap.get(event),
                        PluginResult.Status.OK);
            }
        }
    };

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        //nothing to init
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        activity = (Activity)super.cordova.getActivity();

        Log.i("AerServSDKPhoneGapPlugin", "using action: " + action);

        if (action.equals("loadInterstitial")) {
            interstitialCallbackContextRef = callbackContext;
            loadInterstitial(args.getString(0), args.getString(1), args.getBoolean(2));
            return true;
        } else if (action.equals("loadBanner")) {

            bannerCallbackContextRef = callbackContext;
            loadBanner(args.getString(0), args.getInt(1), args.getInt(2), args.getInt(3), args.getString(4));

            return true;

        }	else if (action.equals("killBanner")) {

            killBanner();

            return true;

        } else if (action.equals("showInterstitial")) {
            showInterstitial();
            return true;
        }

        return false;  // Returning false results in a "MethodNotFound" error.
    }

    public static void loadInterstitial(String plc, String keyWords, boolean preload) {
        Log.i("AerServSDKPhoneGapPlugin", "using : " + plc);

        AerServConfig config = new AerServConfig(activity, plc);
        config.setEventListener(interstitialEventListener);

        if(!keyWords.equals("")) {

            Log.i("AerServSDKPhoneGapPlugin", "using keyWords: " + keyWords);
            config.setKeywords(new ArrayList<String>(Arrays.asList(keyWords.split(","))));
        }

        config.setPreload(preload);
        asInterstitial = new AerServInterstitial(config);
        if (!preload) {
            asInterstitial.show();
        }
    }

    public static void showInterstitial() {
        if (asInterstitial != null) {
            asInterstitial.show();
        }
    }

    public static void loadBanner(String plc, int width, int height, int position, String keyWords) {
        Log.i("AerServSDKPhoneGapPlugin", "using : " + plc);

        AerServConfig config = new AerServConfig(activity, plc);

        Log.i("AerServSDKPhoneGapPlugin", "banner is: " + keyWords);
        if(!keyWords.equals("")) {

            Log.i("AerServSDKPhoneGapPlugin", "using keyWords: " + keyWords);
            config.setKeywords(new ArrayList<String>(Arrays.asList(keyWords.split(","))));
        }

        config.setEventListener(bannerEventListener);

        if(banner == null)
            banner = new ASAdViewWrapper(activity, config, width, height, position);
        else {
            banner.kill();
            banner = new ASAdViewWrapper(activity, config, width, height, position);
        }
        banner.loadAd();
    }

    private static void sendPluginResult(CallbackContext callbackContext,
            String callbackFunctionName, PluginResult.Status status, Object... params) {
        JSONArray args = new JSONArray();
        args.put(callbackFunctionName);
        for (Object param : params) {
            args.put(param);
        }
        PluginResult result = new PluginResult(status, args);
        result.setKeepCallback(true);
        callbackContext.sendPluginResult(result);
    }

    public static void killBanner() {

        if(banner != null) {

            banner.kill();
            PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
            bannerCallbackContextRef.sendPluginResult(result);


        } else {
            Log.e("killBanner", "Could not find banner to kill.  Are you sure you have one?");
        }

    }

    public static void pauseBanner() {

        if(banner != null) {

            banner.pause();
            PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
            bannerCallbackContextRef.sendPluginResult(result);


        } else {
            Log.e("killBanner", "Could not find banner to pause.  Are you sure you have one?");
        }

    }

    public static void playBanner() {

        if(banner != null) {

            banner.play();
            PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
            result.setKeepCallback(true);
            bannerCallbackContextRef.sendPluginResult(result);

        } else {
            Log.e("killBanner", "Could not find banner to play.  Are you sure you have one?");
        }

    }
}
