<script>
  import { Button } from '$lib/components/ui/Button.svelte';
  import { Input } from '$lib/components/ui/Input.svelte';
  import { Textarea } from '$lib/components/ui/Textarea.svelte';
  import { Select } from '$lib/components/ui/Select.svelte';
  import { Switch } from '$lib/components/ui/Switch.svelte';
  import { onMount } from 'svelte';

  let settings = $state({
    siteName: 'Ishan Parihar Coaching',
    siteDescription: 'Personal growth and wellness platform',
    siteEmail: 'admin@ishanparihar.com',
    sitePhone: '+91-9876543210',
    siteAddress: 'Mumbai, India',
    enableComments: true,
    enableNewsletter: true,
    enableContactForm: true,
    enableSocialLogin: true,
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    maintenanceMode: false,
    analyticsCode: '',
    socialLinks: {
      twitter: 'https://twitter.com/ishanparihar',
      facebook: 'https://facebook.com/ishanparihar',
      instagram: 'https://instagram.com/ishanparihar',
      linkedin: 'https://linkedin.com/in/ishanparihar'
    }
  });
  
  let loading = $state(false);
  let error = $state(null);
  let success = $state(null);

  onMount(async () => {
    // In a real app, this would fetch settings from the server
    console.log('Loading settings...');
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    loading = true;
    error = null;
    success = null;

    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving settings:', settings);
      // In real implementation, this would be an API call
      // await apiClient.admin.settings.updateSettings(settings);
      
      success = 'Settings updated successfully!';
      setTimeout(() => {
        success = null;
      }, 3000);
    } catch (err) {
      error = 'Failed to update settings. Please try again.';
      console.error('Error updating settings:', err);
    } finally {
      loading = false;
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested object properties like socialLinks.twitter
      const [parent, child] = field.split('.');
      settings = {
        ...settings,
        [parent]: {
          ...settings[parent],
          [child]: value
        }
      };
    } else {
      settings = { ...settings, [field]: value };
    }
  };

  const handleToggle = (field) => {
    if (field.includes('.')) {
      // Handle nested object properties like socialLinks.twitter
      const [parent, child] = field.split('.');
      settings = {
        ...settings,
        [parent]: {
          ...settings[parent],
          [child]: !settings[parent][child]
        }
      };
    } else {
      settings = { ...settings, [field]: !settings[field] };
    }
  };
</script>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Site Settings</h1>
    <p class="mt-1 text-sm text-gray-600">
      Configure your site settings and preferences
    </p>
  </div>

  <form on:submit={handleSubmit} class="space-y-8">
    {#if error}
      <div class="bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    {/if}

    {#if success}
      <div class="bg-green-50 border-l-4 border-green-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{success}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- General Settings -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="siteName" class="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
          <Input
            id="siteName"
            type="text"
            placeholder="Enter site name"
            bind:value={settings.siteName}
          />
        </div>

        <div>
          <label for="siteEmail" class="block text-sm font-medium text-gray-700 mb-1">Site Email</label>
          <Input
            id="siteEmail"
            type="email"
            placeholder="admin@example.com"
            bind:value={settings.siteEmail}
          />
        </div>

        <div class="md:col-span-2">
          <label for="siteDescription" class="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
          <Textarea
            id="siteDescription"
            placeholder="Brief description of your site"
            rows="3"
            bind:value={settings.siteDescription}
          />
        </div>

        <div>
          <label for="sitePhone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <Input
            id="sitePhone"
            type="tel"
            placeholder="+91-1234567890"
            bind:value={settings.sitePhone}
          />
        </div>

        <div class="md:col-span-2">
          <label for="siteAddress" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <Textarea
            id="siteAddress"
            placeholder="Physical address of your business"
            rows="2"
            bind:value={settings.siteAddress}
          />
        </div>
      </div>
    </div>

    <!-- Site Preferences -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Site Preferences</h2>
      
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Enable Comments</label>
            <p class="text-sm text-gray-500">Allow users to comment on your content</p>
          </div>
          <Switch
            checked={settings.enableComments}
            on:change={() => handleToggle('enableComments')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Enable Newsletter</label>
            <p class="text-sm text-gray-500">Allow users to subscribe to newsletter</p>
          </div>
          <Switch
            checked={settings.enableNewsletter}
            on:change={() => handleToggle('enableNewsletter')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Enable Contact Form</label>
            <p class="text-sm text-gray-500">Show contact form on your site</p>
          </div>
          <Switch
            checked={settings.enableContactForm}
            on:change={() => handleToggle('enableContactForm')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Enable Social Login</label>
            <p class="text-sm text-gray-500">Allow users to login with social accounts</p>
          </div>
          <Switch
            checked={settings.enableSocialLogin}
            on:change={() => handleToggle('enableSocialLogin')}
          />
        </div>

        <div class="flex items-center justify-between">
          <div>
            <label class="text-sm font-medium text-gray-900">Maintenance Mode</label>
            <p class="text-sm text-gray-500">Temporarily disable public access to your site</p>
          </div>
          <Switch
            checked={settings.maintenanceMode}
            on:change={() => handleToggle('maintenanceMode')}
          />
        </div>
      </div>
    </div>

    <!-- Social Links -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Social Links</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="social-twitter" class="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
          <Input
            id="social-twitter"
            type="url"
            placeholder="https://twitter.com/username"
            bind:value={settings.socialLinks.twitter}
          />
        </div>

        <div>
          <label for="social-facebook" class="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
          <Input
            id="social-facebook"
            type="url"
            placeholder="https://facebook.com/username"
            bind:value={settings.socialLinks.facebook}
          />
        </div>

        <div>
          <label for="social-instagram" class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <Input
            id="social-instagram"
            type="url"
            placeholder="https://instagram.com/username"
            bind:value={settings.socialLinks.instagram}
          />
        </div>

        <div>
          <label for="social-linkedin" class="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <Input
            id="social-linkedin"
            type="url"
            placeholder="https://linkedin.com/in/username"
            bind:value={settings.socialLinks.linkedin}
          />
        </div>
      </div>
    </div>

    <!-- Advanced Settings -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <Select
            id="timezone"
            bind:value={settings.timezone}
          >
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          </Select>
        </div>

        <div>
          <label for="dateFormat" class="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
          <Select
            id="dateFormat"
            bind:value={settings.dateFormat}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </Select>
        </div>

        <div>
          <label for="timeFormat" class="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
          <Select
            id="timeFormat"
            bind:value={settings.timeFormat}
          >
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </Select>
        </div>
      </div>

      <div class="mt-6">
        <label for="analyticsCode" class="block text-sm font-medium text-gray-700 mb-1">Analytics Code</label>
        <Textarea
          id="analyticsCode"
          placeholder="Paste your analytics tracking code here (e.g., Google Analytics)"
          rows="4"
          bind:value={settings.analyticsCode}
        />
      </div>
    </div>

    <div class="flex justify-end">
      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  </form>
</div>