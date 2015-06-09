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

import android.app.Activity;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.util.Log;
import com.aerserv.sdk.*;
import com.aerserv.sdk.AerServBanner;
import com.aerserv.sdk.AerServConfig;
import com.aerserv.sdk.utils.DisplayUtils;

import java.util.ArrayList;

public class ASAdViewWrapper {

    private AerServBanner adView;
    private Activity activity;
    private String plc;
    private FrameLayout.LayoutParams params;

    public ASAdViewWrapper(final Activity activity, final AerServConfig config,
                           final int width, final int height,
                           final int position) {

        this.activity = activity;
        this.plc = plc;
        this.activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                adView = new AerServBanner(activity);
                adView.configure(config);

                params = new FrameLayout.LayoutParams(DisplayUtils.convertDipToPx(activity, width),
                        DisplayUtils.convertDipToPx(activity, height));


                if (position == 0)
                    params.gravity = Gravity.TOP | Gravity.CENTER;
                else
                    params.gravity = Gravity.BOTTOM | Gravity.CENTER;
            }
        });


    }

    public void loadAd() {
        this.activity.runOnUiThread(new Runnable() {

            @Override
            public void run() {

                activity.addContentView(adView, params);
                adView.show();
            }

        });
    }

    public void kill() {

        this.activity.runOnUiThread(new Runnable() {

            @Override
            public void run() {

                adView.kill();

                ViewGroup parentGroup = (ViewGroup)adView.getParent();

                if(parentGroup != null)
                    parentGroup.removeView(adView);
            }
        });

    }

    public void play(){

        this.activity.runOnUiThread(new Runnable() {

            @Override
            public void run() {

                adView.play();
            }

        });

    }

    public void pause(){

        this.activity.runOnUiThread(new Runnable() {

            @Override
            public void run() {

                adView.pause();

            }

        });

    }
}
