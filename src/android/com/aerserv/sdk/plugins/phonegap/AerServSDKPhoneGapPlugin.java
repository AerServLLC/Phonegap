/* Copyright (c) AerServ, 2015
 *
 * This unpublished material is proprietary to AerServ, LLC.
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
import java.util.ArrayList;
import java.util.Arrays;
import com.aerserv.sdk.ASAdView;
import com.aerserv.sdk.ASAdListener;
import com.aerserv.sdk.ASInterstitial;

public class AerServSDKPhoneGapPlugin extends CordovaPlugin {

	private static Activity activity;
	private static CallbackContext interstitialCallbackContextRef;
	private static CallbackContext bannerCallbackContextRef;
	private static ASAdViewWrapper banner;

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		//nothing to init
	}

	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

		activity = (Activity)super.cordova;

		Log.i("AerServSDKPhoneGapPlugin", "using action: " + action);

		if (action.equals("loadInterstitial")) {
			
			interstitialCallbackContextRef = callbackContext;
			loadInterstitial(args.getString(0), args.getString(1));

			return true;
		} else if (action.equals("loadBanner")) {

			bannerCallbackContextRef = callbackContext;
			loadBanner(args.getString(0), args.getInt(1), args.getInt(2), args.getInt(3), args.getString(4));
		
			return true;

		}	else if (action.equals("killBanner")) {

			killBanner();
		
			return true;

		}

		return false;  // Returning false results in a "MethodNotFound" error.
	}


	public static void loadInterstitial(String plc, String keyWords) {

		Log.i("AerServSDKPhoneGapPlugin", "using : " + plc);

		final ASInterstitial asInterstitial = new ASInterstitial(activity, plc, false);


		if(!keyWords.equals("")) {
		 
			Log.i("AerServSDKPhoneGapPlugin", "using keyWords: " + keyWords);
			asInterstitial.setKeyWords(new ArrayList<String>(Arrays.asList(keyWords.split(","))));
		}

		asInterstitial.setAdListener(new ASAdListener() {

			@Override
			public void onAdLoaded() {

				JSONArray args = new JSONArray();
				args.put("onAdLoadedCallback");
				args.put("");
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				interstitialCallbackContextRef.sendPluginResult(result);

				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Loaded");
			}

			@Override
			public void onAdFailed(final String message) {

				JSONArray args = new JSONArray();
				args.put("onAdFailedCallback");
				args.put(message);
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);

				Log.i("AerServSDKPhoneGapPlugin", "callbackContext is: " + interstitialCallbackContextRef);
				interstitialCallbackContextRef.sendPluginResult(result);


				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Failed: " + message);
			}

			@Override
			public void onAdShown() {

				JSONArray args = new JSONArray();
				args.put("onAdShownCallback");
				args.put("");
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				interstitialCallbackContextRef.sendPluginResult(result);

				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Shown");
			}

			@Override
			public void onAdClicked() {

				JSONArray args = new JSONArray();
				args.put("onAdClickedCallback");
				args.put("");
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				interstitialCallbackContextRef.sendPluginResult(result);

				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Clicked");
			}

			@Override
			public void onAdDismissed() {

				JSONArray args = new JSONArray();
				args.put("onAdDismissedCallback");
				args.put("");
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				interstitialCallbackContextRef.sendPluginResult(result);

				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Dismissed");
			}

		});

		asInterstitial.loadAd();

	}

	public static void loadBanner(String plc, int width, int height, int position, String keyWords) {

		Log.i("AerServSDKPhoneGapPlugin", "using : " + plc);

		if(banner == null)
			banner = new ASAdViewWrapper(activity, plc, width, height, position);
		else {
			banner.kill();
			banner = new ASAdViewWrapper(activity, plc, width, height, position);
		}

		Log.i("AerServSDKPhoneGapPlugin", "banner is: " + keyWords);
		if(!keyWords.equals("")) {
		 
			Log.i("AerServSDKPhoneGapPlugin", "using keyWords: " + keyWords);
			banner.setKeyWords(new ArrayList<String>(Arrays.asList(keyWords.split(","))));
		}

		banner.setAdListener(new ASAdListener() {

			@Override
			public void onAdLoaded() {

				JSONArray args = new JSONArray();
				args.put("onAdLoadedCallback");
				args.put("");
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				bannerCallbackContextRef.sendPluginResult(result);

				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Loaded");
			}

			@Override
			public void onAdFailed(final String message) {

				JSONArray args = new JSONArray();
				args.put("onAdFailedCallback");
				args.put(message);
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				bannerCallbackContextRef.sendPluginResult(result);


				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Failed: " + message);
			}

			@Override
			public void onAdShown() {

				JSONArray args = new JSONArray();
				args.put("onAdShownCallback");
				args.put("");
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				bannerCallbackContextRef.sendPluginResult(result);

				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Shown");
			}

			@Override
			public void onAdClicked() {

				JSONArray args = new JSONArray();
				args.put("onAdClickedCallback");
				args.put("");
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				bannerCallbackContextRef.sendPluginResult(result);

				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Clicked");
			}

			@Override
			public void onAdDismissed() {

				JSONArray args = new JSONArray();
				args.put("onAdDismissedCallback");
				args.put("");
				PluginResult result = new PluginResult(PluginResult.Status.OK, args);
				result.setKeepCallback(true);
				bannerCallbackContextRef.sendPluginResult(result);

				Log.d("AerServSDKPhoneGapPlugin", "Interstitial Dismissed");
			}

		});

		banner.loadAd();

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
