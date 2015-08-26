/* Copyright (c) AerServ, 2015
 *
 * This unpublished material is proprietary to AerServ, LLC.
 * All rights reserved. The methods and
 * techniques described herein are considered trade secrets
 * and/or confidential. Reproduction or distribution, in whole
 * or in part, is forbidden except by express written permission
 * of AerServ.
 */
#import <stdio.h>
#import "AerServSDKPhoneGapPlugin.h"


#define BANNER_TOP 0
#define BANNER_BOTTOM 1

@interface AerServSDKPhoneGapPlugin ()<ASInterstitialViewControllerDelegate, ASAdViewDelegate>

@property (strong, nonatomic) ASInterstitialViewController* adController;
@property (strong, nonatomic) ASAdView *bannerView;
@property (strong, nonatomic) UIViewController *rootViewController;
@property (strong, nonatomic) CDVInvokedUrlCommand *interstitial_command;
@property (strong, nonatomic) CDVInvokedUrlCommand *banner_command;

@end


@implementation AerServSDKPhoneGapPlugin




/** start of interstitial methods **/

- (void) loadInterstitial:(CDVInvokedUrlCommand *)command {

	self.interstitial_command =  command;
	NSString* plc = [command.arguments objectAtIndex:0];
	NSString* keyWords = [command.arguments objectAtIndex:1];
    NSString* preloadStr = [command.arguments objectAtIndex:2];
    [self showInterstitial:plc keyWords:keyWords preload:[preloadStr boolValue]];


}

- (void) showInterstitial:(NSString *) plc keyWords:(NSString *) keyWords preload:(bool) preload {

    self.rootViewController = [UIApplication sharedApplication].keyWindow.rootViewController;


	self.adController = [ASInterstitialViewController viewControllerForPlacementID:plc withDelegate:self];
	if(preload) {
		self.adController.isPreload = preload;
	}

	if([keyWords length] != 0) {

		NSMutableArray *asKeyWords = [[keyWords componentsSeparatedByString:@","] mutableCopy];    		
		self.adController.keyWords = [asKeyWords copy];

	}

	//self.adController.timeoutInterval = 5;
	[self.adController loadAd];

}

- (void) interstitialViewControllerAdLoadedSuccessfully:(ASInterstitialViewController *)viewController {

	[self.adController showFromViewController:self.rootViewController];

	NSLog(@"ad was loaded");

	NSArray *args = @[@"onAdLoadedCallback", @""];
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
	[result setKeepCallbackAsBool:YES]; 
	[self.commandDelegate sendPluginResult:result callbackId:self.interstitial_command.callbackId];

}


-(void) intersitialViewControllerAdFailedToLoad:(ASInterstitialViewController*)viewController withError:(NSError*)error {


	NSLog(@"ad Failed to load with error:%@", error);

	NSArray *args = @[@"onAdFailedCallback", [error localizedDescription]];
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
	[result setKeepCallbackAsBool:YES]; 
	[self.commandDelegate sendPluginResult:result callbackId:self.interstitial_command.callbackId];

}


-(void) interstitialViewControllerAdWasTouched:(ASInterstitialViewController *)viewController {

	NSLog(@"ad was touched");

	NSArray *args = @[@"onAdClickedCallback", @""];
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
	[result setKeepCallbackAsBool:YES]; 
	[self.commandDelegate sendPluginResult:result callbackId:self.interstitial_command.callbackId];
}


-(void)interstitialViewControllerDidDisappear:(ASInterstitialViewController *)viewController {


	NSLog(@"ad finished");

	NSArray *args = @[@"onAdShownCallback", @""];
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
	[result setKeepCallbackAsBool:YES]; 
	[self.commandDelegate sendPluginResult:result callbackId:self.interstitial_command.callbackId];

	self.adController = nil;
}

- (void)interstitialViewControllerDidPreloadAd:(ASInterstitialViewController *)viewController {
    NSLog(@"ad preloaded");
    NSArray *args = @[@"onPreloadReadyCallback", @""];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:self.interstitial_command.callbackId];
}

- (void)interstitialViewControllerDidVirtualCurrencyLoad:(ASInterstitialViewController *)viewController vcData:(NSDictionary *)vcData {
    NSLog(@"virtual currency loaded with name=%@ and rewardAmount=%@", vcData[@"name"], vcData[@"rewardAmount"]);
    NSArray *args = @[@"onVcReadyCallback", vcData[@"name"], vcData[@"rewardAmount"]];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:self.interstitial_command.callbackId];
}

- (void)interstitialViewControllerDidVirtualCurrencyReward:(ASAdView *)adView vcData:(NSDictionary *)vcData {
    NSLog(@"virtual currency rewarded with name=%@ and rewardAmount=%@", vcData[@"name"], vcData[@"rewardAmount"]);
    NSArray *args = @[@"onVcRewardedCallback", vcData[@"name"], vcData[@"rewardAmount"]];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:self.interstitial_command.callbackId];
}

/** end of interstitial methods **/



/** start of banner methods **/

- (void) loadBanner:(CDVInvokedUrlCommand *)command {

	self.banner_command =  command;
	NSString* plc = [command.arguments objectAtIndex:0];
	int  width = [[command.arguments objectAtIndex:1] integerValue];
	int height = [[command.arguments objectAtIndex:2] integerValue];
	int position = [[command.arguments objectAtIndex:3] integerValue];
	NSString* keyWords = [command.arguments objectAtIndex:4];
	[self showBanner:plc width:width height:height position:position keyWords:keyWords];


}

- (void) showBanner:(NSString *) plc width:(int) width height:(int) height position:(int) position keyWords:(NSString *) keyWords {

	self.rootViewController = [UIApplication sharedApplication].keyWindow.rootViewController;

	if (self.bannerView != nil) {
		[self.bannerView removeFromSuperview];
		self.bannerView = nil;
	}


	NSLog(@"plc: %@, width:%d, height:%d, position:%d, keyWords:%@", plc, width, height, position, keyWords);

	CGSize size = { width, height };
	self.bannerView = [[ASAdView alloc] initWithPlacementID:plc size:size];

	self.bannerView.isTesting = NO;
	self.bannerView.sizeAdToFit = YES;
	//self.bannerView.timeoutInterval = 5.0;
	if([keyWords length] != 0) {

		NSMutableArray *asKeyWords = [[keyWords componentsSeparatedByString:@","] mutableCopy];    		
		self.bannerView.keyWords = [asKeyWords copy];

	}

	self.bannerView.delegate = self;
	[self.rootViewController.view addSubview:self.bannerView];
	[self.bannerView loadAd];


	CGRect viewFrame = self.rootViewController.view.bounds;
	CGSize adSize = self.bannerView.adContentSize;

	// if the   wider than it is tall and the ad doesn't fit we need to scale accordingly.
	if (CGRectGetWidth(viewFrame) < adSize.width) {
		float aspectRatio = adSize.width/adSize.height;

		adSize.width = CGRectGetWidth(viewFrame);
		adSize.height = floorf(adSize.width / aspectRatio);
	}

	// if the ad is wider than it is tall and the ad doesn't fit we need to scale accordingly.
	if (CGRectGetHeight(viewFrame) < adSize.height) {
		float aspectRatio = adSize.height/adSize.width;

		adSize.height = CGRectGetHeight(viewFrame);
		adSize.width = floorf(adSize.height / aspectRatio);
	}


	// set the frame and center the video.
	self.bannerView.frame = CGRectMake(0,0,adSize.width, adSize.height);

	if( position == BANNER_BOTTOM) {
		self.bannerView.center = CGPointMake(CGRectGetMidX(viewFrame), CGRectGetHeight(viewFrame) - adSize.height + adSize.height/2);
	} else if( position == BANNER_TOP) {
		self.bannerView.center = CGPointMake(CGRectGetMidX(viewFrame), adSize.height - adSize.height/2);
	}


}

- (void) killBanner:(CDVInvokedUrlCommand *)command{

	if (self.bannerView != nil) {
		[self.bannerView removeFromSuperview];
		self.bannerView = nil;
	}

}

-(void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{ [self.rootViewController.view endEditing:YES]; }

/*not supported yet*/
-(void) pauseBanner {
	if(self.bannerView != nil)
		[self.bannerView pause];
}

/*not supported yet*/
-(void) playBanner {
	if(self.bannerView != nil)
		[self.bannerView play];

}

- (UIViewController *)viewControllerForPresentingModalView {

	return self.rootViewController;
}

- (void)adViewDidLoadAd:(ASAdView *)adView {

	NSLog(@"banner ad was loaded");
	
	NSArray *args = @[@"onAdLoadedCallback", @""];
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
	[result setKeepCallbackAsBool:YES]; 
	[self.commandDelegate sendPluginResult:result callbackId:self.banner_command.callbackId];


}

-(void) adViewDidPreloadAd:(ASAdView *)adView {
	NSLog(@"Banner Ad has preloaded");

	NSArray *args = @[@"onPreloadReadyCallback", @""];
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
	[result setKeepCallbackAsBool:YES];
	[self.commandDelegate sendPluginResult:result callbackId:self.interstitial_command.callbackId];
}

-(void) adViewDidFailToLoadAd:(ASAdView *)adView withError:(NSError *)error {

	NSLog(@"ad Failed to load with error:%@", error);

	NSArray *args = @[@"onAdFailedCallback", [error localizedDescription]];
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
	[result setKeepCallbackAsBool:YES]; 
	[self.commandDelegate sendPluginResult:result callbackId:self.banner_command.callbackId];

	[self.bannerView removeFromSuperview];
	self.bannerView = nil;
}

- (void) adWasClicked:(ASAdView *)adView {
	NSLog(@"banner ad was clicked");

	NSArray *args = @[@"onAdClickedCallback", @""];
	CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
	[result setKeepCallbackAsBool:YES]; 
	[self.commandDelegate sendPluginResult:result callbackId:self.banner_command.callbackId];
}

- (void)adViewDidVirtualCurrencyLoad:(ASAdView *)adView vcData:(NSDictionary *)vcData {
    NSLog(@"virtual currency loaded with name=%@ and rewardAmount=%@", vcData[@"name"], vcData[@"rewardAmount"]);
    NSArray *args = @[@"onVcReadyCallback", vcData[@"name"], vcData[@"rewardAmount"]];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:self.banner_command.callbackId];
}

-(void) adViewDidVirtualCurrencyReward:(ASAdView *)adView vcData:(NSDictionary *)vcData {
    NSLog(@"virtual currency rewarded with name=%@ and rewardAmount=%@", vcData[@"name"], vcData[@"rewardAmount"]);
    NSArray *args = @[@"onVcRewardedCallback", vcData[@"name"], vcData[@"rewardAmount"]];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray: args];
    [result setKeepCallbackAsBool:YES];
    [self.commandDelegate sendPluginResult:result callbackId:self.banner_command.callbackId];
}

/** end of banner methods **/

@end
