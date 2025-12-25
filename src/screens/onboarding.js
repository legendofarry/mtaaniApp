import { getAuthUser } from "../services/auth.store.js";
import { updateUserProfile, getUserData } from "../services/user.service.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../app/router.js";
import pushService from "../services/push.service.js";
import { requestNotificationPermission as askNotifPerm } from "../utils/permissions.js";
import { saveSubscriptionForUser } from "../services/push.service.js";
import { VAPID_PUBLIC_KEY } from "../config/pushConfig.js";

export const renderOnboarding = async () => {
  const content = document.getElementById("content");
  const user = getAuthUser();

  if (!user) {
    content.innerHTML = `<div class="p-6">Please login first.</div>`;
    return;
  }

  // pre-fill if user already has some data
  const existing = (await getUserData(user.uid)) || {};

  content.innerHTML = `
    <div class="p-4 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-2">Welcome — Let's set up your account</h2>
      <p class="text-sm text-gray-600 mb-4">Please provide a phone number, your location and enable device permissions to get the best experience.</p>

      <div class="bg-white rounded-xl shadow p-4">
        <form id="onboard-form" class="space-y-3">
          <div>
            <label class="text-xs text-gray-600">Phone number</label>
            <input id="onboard-phone" value="${
              existing.phone || ""
            }" required class="w-full border rounded p-2 mt-1" />
          </div>

          <div>
            <label class="text-xs text-gray-600">County</label>
            <input id="onboard-county" value="${
              (existing.location && existing.location.county) || ""
            }" required class="w-full border rounded p-2 mt-1" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-gray-600">Area</label>
              <input id="onboard-area" value="${
                (existing.location && existing.location.area) || ""
              }" required class="w-full border rounded p-2 mt-1" />
            </div>
            <div>
              <label class="text-xs text-gray-600">Zone</label>
              <input id="onboard-zone" value="${
                (existing.location && existing.location.zone) || ""
              }" class="w-full border rounded p-2 mt-1" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label class="text-xs text-gray-600">Estate</label>
              <input id="onboard-estate" value="${
                (existing.location && existing.location.estate) || ""
              }" class="w-full border rounded p-2 mt-1" />
            </div>
            <div>
              <label class="text-xs text-gray-600">Court</label>
              <input id="onboard-court" value="${
                (existing.location && existing.location.court) || ""
              }" class="w-full border rounded p-2 mt-1" />
            </div>
            <div>
              <label class="text-xs text-gray-600">Plot / Block</label>
              <input id="onboard-plot" value="${
                (existing.location && existing.location.plot) || ""
              }" class="w-full border rounded p-2 mt-1" />
            </div>
          </div>

          <div>
            <label class="text-xs text-gray-600">Geo location (lat / lng)</label>
            <div class="flex gap-2 mt-1">
              <input id="onboard-lat" placeholder="lat" value="${
                (existing.location &&
                  existing.location.geo &&
                  existing.location.geo.lat) ||
                ""
              }" class="flex-1 border rounded p-2" />
              <input id="onboard-lng" placeholder="lng" value="${
                (existing.location &&
                  existing.location.geo &&
                  existing.location.geo.lng) ||
                ""
              }" class="flex-1 border rounded p-2" />
              <button type="button" id="btn-get-geo" class="px-3 py-2 bg-indigo-600 text-white rounded">Use my location</button>
            </div>
          </div>

          <div class="bg-gray-50 p-3 rounded">
            <p class="text-sm text-gray-700 font-medium mb-2">Device permissions</p>
            <div class="flex flex-col gap-2">
              <label><input id="perm-sms" type="checkbox" /> Allow SMS read (simulated)</label>
              <label><input id="perm-location" type="checkbox" /> Allow location</label>
              <label><input id="perm-notifs" type="checkbox" /> Allow notifications</label>
              <label><input id="perm-bg" type="checkbox" /> Allow background sync (simulated)</label>
            </div>
          </div>

          <div class="flex justify-end gap-2">
            <button type="button" id="onboard-cancel" class="px-3 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" class="px-3 py-2 bg-green-600 text-white rounded">Complete onboarding</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById("btn-get-geo").onclick = () => {
    if (!navigator.geolocation)
      return showToast("Geolocation not supported", "error");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        document.getElementById("onboard-lat").value = lat;
        document.getElementById("onboard-lng").value = lng;
        document.getElementById("perm-location").checked = true;
        showToast("Location captured", "success");
      },
      (err) => showToast("Failed to get location", "error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  document.getElementById("onboard-cancel").onclick = () =>
    navigate("/profile");

  document.getElementById("onboard-form").onsubmit = async (e) => {
    e.preventDefault();
    const phone = document.getElementById("onboard-phone").value.trim();
    const county = document.getElementById("onboard-county").value.trim();
    const area = document.getElementById("onboard-area").value.trim();
    const zone = document.getElementById("onboard-zone").value.trim();
    const estate = document.getElementById("onboard-estate").value.trim();
    const court = document.getElementById("onboard-court").value.trim();
    const plot = document.getElementById("onboard-plot").value.trim();
    const lat =
      parseFloat(document.getElementById("onboard-lat").value) || null;
    const lng =
      parseFloat(document.getElementById("onboard-lng").value) || null;

    if (!phone || !county || !area)
      return showToast("Please fill phone, county and area", "warning");

    // request notification permission and register push subscription
    const permissions = {
      smsRead: !!document.getElementById("perm-sms")?.checked, // simulated on web
      location: !!document.getElementById("perm-location")?.checked,
      notifications: false,
      backgroundSync: !!document.getElementById("perm-bg")?.checked,
    };

    if (document.getElementById("perm-notifs")?.checked) {
      const p = await askNotifPerm();
      permissions.notifications = p === 'granted';
      if (permissions.notifications) {
        // register SW and subscribe to push (VAPID key required)
        await pushService.registerServiceWorker();
        if (typeof VAPID_PUBLIC_KEY !== 'undefined' && VAPID_PUBLIC_KEY) {
          const sub = await pushService.subscribeToPush(VAPID_PUBLIC_KEY);
          if (sub) {
            await saveSubscriptionForUser(sub);
          }
        } else {
          console.warn('VAPID_PUBLIC_KEY not configured; push subscription skipped');
        }
      }
    }

    const location = {
      county,
      area,
      zone: zone || undefined,
      estate: estate || undefined,
      court: court || undefined,
      plot: plot || undefined,
      geo: lat && lng ? { lat, lng } : undefined,
    };

    try {
      await updateUserProfile(user.uid, {
        phone,
        location,
        permissions,
        onboarded: true,
      });
      showToast("Onboarding complete", "success");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      showToast("Failed to complete onboarding", "error");
    }
  };
};

export default renderOnboarding;
