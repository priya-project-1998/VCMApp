package com.vcmapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    // ✅ Required for react-native-gesture-handler
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null) // important for proper navigation gesture handling
    }

    override fun getMainComponentName(): String = "VCMApp"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
