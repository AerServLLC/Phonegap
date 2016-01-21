//
//  AerServCustomEventInterstitial.m
//
//  Copyright (c) 2015 AerServ. All rights reserved.
//

#import "AerServCustomEventInterstitial.h"
#import "AerServSDK/ASAdView.h"
#import "AerServSDK/ASInterstitialViewController.h"


@interface AerServCustomEventInterstitial () <ASInterstitialViewControllerDelegate>

@property (nonatomic, strong) ASInterstitialViewController *asInterstitial;

@end


@implementation AerServCustomEventInterstitial

- (void)requestInterstitialWithCustomEventInfo:(NSDictionary *)info {
    // Instantiate ad
    NSString *placement = [info objectForKey:@"placement"];
    self.asInterstitial = [ASInterstitialViewController viewControllerForPlacementID:placement withDelegate:self];
    
    // Set optional timeout parameter
    NSTimeInterval timeoutMillis = [[info objectForKey:@"timeoutMillis"] integerValue];
    if (timeoutMillis) {
        self.asInterstitial.timeoutInterval = timeoutMillis;
    }
    
    // Set optional keywords parameter
    NSString *keywordsJson = [info objectForKey:@"keywords"];
    if (keywordsJson) {
        NSData *keywordData = [keywordsJson dataUsingEncoding:NSUTF8StringEncoding];
        NSError *error;
        id keywordObjects = [NSJSONSerialization JSONObjectWithData:keywordData options:0 error:&error];
        if (error) {
            NSLog(@"Error reading keyword list: %@", error);
        } else {
            self.asInterstitial.keyWords = keywordObjects;
        }
    }
    
    [self.asInterstitial loadAd];
}

- (void)showInterstitialFromRootViewController:(UIViewController *)rootViewController {
    [self.asInterstitial showFromViewController:rootViewController];
}

- (void)interstitialViewControllerAdLoadedSuccessfully:(ASInterstitialViewController *)viewController {
    [self.delegate interstitialCustomEvent:self didLoadAd:self];
}

- (void)intersitialViewControllerAdFailedToLoad:(ASInterstitialViewController *)viewController withError:(NSError *)error {
    [self.delegate interstitialCustomEvent:self didFailToLoadAdWithError:error];
}

- (void)intersitialViewControllerWillAppear:(ASInterstitialViewController *)viewController {
    [self.delegate interstitialCustomEventWillAppear:self];
}

- (void)intersitialViewControllerDidAppear:(ASInterstitialViewController *)viewController {
    [self.delegate interstitialCustomEventDidAppear:self];
}

- (void)interstitialViewControllerWillDisappear:(ASInterstitialViewController *)viewController {
    [self.delegate interstitialCustomEventWillDisappear:self];
}

- (void)interstitialViewControllerDidDisappear:(ASInterstitialViewController *)viewController {
    [self.delegate interstitialCustomEventDidDisappear:self];
}

- (void)interstitialViewControllerAdWasTouched:(ASInterstitialViewController *)viewController {
    [self.delegate interstitialCustomEventDidReceiveTapEvent:self];
}

- (void)dealloc {
    self.asInterstitial = nil;
}

@end
