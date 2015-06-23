/* Copyright (c) AerServ, 2015
 *
 * This unpublished material is proprietary to AerServ, LLC.
 * All rights reserved. The methods and
 * techniques described herein are considered trade secrets
 * and/or confidential. Reproduction or distribution, in whole
 * or in part, is forbidden except by express written permission
 * of AerServ.
 */
#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import "AerServSDK/ASInterstitialViewController.h"
#import "AerServSDK/ASAdView.h"

@interface AerServSDKPhoneGapPlugin : CDVPlugin

- (void) loadInterstitial:(CDVInvokedUrlCommand *)command;
- (void) loadBanner:(CDVInvokedUrlCommand *)command;
- (void) showInterstitial:(NSString *) plc keyWords:(NSString *) keyWords preload:(bool) preload;
- (void) showBanner:(NSString *) plc width:(int) width height:(int) height position:(int) position keyWords:(NSString *) keyWords;
- (void) killBanner:(CDVInvokedUrlCommand *)command;
- (void) pauseBanner; //not supported yet
- (void) playBanner; //not supported yet

@end

