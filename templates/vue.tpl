	new Vue(
		{
			el: '#app',

			delimiters: ['${', '}'],

			data:
			{
			},

			mounted: function ()
			{
				if (getCookie('isLoggedIn') !== 'true')
				{
					window.location = '/';
				}
			}
		}
	);