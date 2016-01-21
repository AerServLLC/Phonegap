//
//  AerServCustomEventBanner.m
//
//  Copyright (c) 2015 AerServ. All rights reserved.
//

#import "AerServCustomEventBanner.h"
#import "AerServSDK/ASAdView.h"

@interface AerServCustomEventBanner () <ASAdViewDelegate>

@property (nonatomic, strong) ASAdView *asBanner;

@end


@implementation AerServCustomEventBanner

- (void)requestAdWithSize:(CGSize)size customEventInfo:(NSDictionary *)info {
    // Instantiate ad
    NSString *placement = [info objectForKey:@"placement"];
    
    self.asBanner = [[ASAdView alloc] initWithPlacementID:placement size:ASMediumRectSize];
    self.asBanner.delegate = self;
    
    // Set optional timeout parameter
    NSTimeInterval timeoutMillis = [[info objectForKey:@"timeoutMillis"] integerValue];
    if (timeoutMillis) {
        self.asBanner.timeoutInterval = timeoutMillis;
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
            self.asBanner.keyWords = keywordObjects;
        }
    }
    
    [self.asBanner loadAd];
}

- (void)adViewDidLoadAd:(ASAdView *)adView {
    [self.delegate bannerCustomEvent:self didLoadAd:self.asBanner];
}

- (void)adViewDidFailToLoadAd:(ASAdView *)adView withError:(NSError *)error {
    [self.delegate bannerCustomEvent:self didFailToLoadAdWithError:error];
}

- (void)willPresentModalViewForAd:(ASAdView *)adView {
    [self.delegate bannerCustomEventWillBeginAction:self];
}

- (void)didDismissModalViewForAd:(ASAdView *)adView {
    [self.delegate bannerCustomEventDidFinishAction:self];
}

- (void)willLeaveApplicatonFromAd:(ASAdView *)adView {
    [self.delegate bannerCustomEventWillLeaveApplication:self];
}

- (UIViewController *)viewControllerForPresentingModalView {
    return [self.delegate viewControllerForPresentingModalView];
}

- (void)dealloc {
    self.asBanner = nil;
}

@end
