'use strict';

module.exports = function(date) {

	function toHijri(g_y, g_m, g_d) {
			
		var g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

		var gy = g_y-1600;
		var gm = g_m-1;
		var gd = g_d-1;

		var g_day_no = 365 * gy + parseInt((gy + 3) / 4) - parseInt((gy + 99) / 100) + parseInt((gy + 399) / 400);

		for (var i = 0; i < gm; ++i) {
			g_day_no += g_days_in_month[i];
		}
		
		if (gm > 1 && ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0))) {		
			++g_day_no;
		}

		g_day_no += gd;

		var j_day_no = g_day_no - 79;

		var j_np = parseInt(j_day_no / 12053);
		j_day_no %= 12053;

		var jy = 979 + 33 * j_np + 4 * parseInt(j_day_no / 1461);

		j_day_no %= 1461;

		if (j_day_no >= 366) {
			jy += parseInt((j_day_no - 1) / 365);
			j_day_no = (j_day_no - 1) % 365;
		}

		for (var j = 0; j < 11 && j_day_no >= j_days_in_month[j]; ++j) {
			j_day_no -= j_days_in_month[j];
		}

		var jm = j + 1;
		var jd = j_day_no + 1;

		return {
			year: jy,
			month: jm,
			day: jd
		};
		
	}

	var today = {
		english: 'Today',
		persian: 'امروز'
	};

	var yesterday = {
		english: 'Yesterday',
		persian: 'دیروز'
	};

	function checkAge(date) {
		var today = new Date();
		if (today.getFullYear() === date.year && today.getMonth() + 1 === date.month) {
			var word;
			switch (today.getDate() - date.day) {
				case 0:
					word = today.persian; // (Today) Get this from dictionary
					break;
				case 1:
					word = yesterday.persian; // (Yesterday) Get this from dictionary
					break;
				default:
					word = false;
					break;
			}
			return word;
		}
		return false;
	}

	var word = checkAge(date);
	if (word) {
		return word + ', ' + date.hour + ':' + date.minute;
	} else {
		var hijri = toHijri(date.year, date.month, date.day);
		return hijri.year + '/' + hijri.month + '/' + hijri.day + '(' + date.year + '/' + date.month + '/' + date.day + ')';
	}

};
