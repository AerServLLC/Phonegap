//
//  AerServSDK.h
//  AerServSDK
//
//  Created by Gary Rudolph on 3/23/14.
//  Copyright (c) 2014 AerServ, LLC. All rights reserved.
//

#import <Foundation/Foundation.h>

#import <AerServSDK/ASConstants.h>
#import <AerServSDK/ASAdView.h>
#import <AerServSDK/ASInterstitialViewController.h>
#import <AerServSDK/ASFileManager.h>
#import <AerServSDK/ASAlertManager.h>
#import <AerServSDK/ASCustomBannerAdProvider.h>
#import <AerServSDK/ASCustomInterstitialAdProvider.h>

@interface AerServSDK : NSObject

/*!
 * Looks into each supplied placement and will run pre-initialization for any mediation partner sources that requires an extra setup phase.
 *
 * @param plcArr, an array of string placement ids (i.e. @[@"1002090", @"1005992"])
 */
+ (void)initializeWithPlacments:(NSArray *)plcArr;

/*!
 * Looks into the supplied site id and will run pre-initialization for any mediation partner sources that requires an extra setup phase.
 *
 * @param siteIdStr, a string of the site id
 */
+ (void)initializeWithSiteID:(NSString *)siteIdStr;

@end
