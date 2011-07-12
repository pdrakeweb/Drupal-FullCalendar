// $Id$

Date.prototype.getWeek = function (dowOffset) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

  dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
  var newYear = new Date(this.getFullYear(),0,1);
  var day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = (day >= 0 ? day : day + 7);
  var daynum = Math.floor((this.getTime() - newYear.getTime() - (this.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
  var weeknum;
  //if the year starts before the middle of a week
  if(day < 4) {
    weeknum = Math.floor((daynum+day-1)/7) + 1;
    if(weeknum > 52) {
      nYear = new Date(this.getFullYear() + 1,0,1);
      nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
      the week, it is week #1 of that year*/
      weeknum = nday < 4 ? 1 : 53;
    }
  }
  else {
    weeknum = Math.floor((daynum+day-1)/7);
  }
  return weeknum;
};

(function ($) {

Drupal.behaviors.fullCalendar = function(context) {
  $('#fullcalendar-content').hide(); //hide the failover display
  $('#fullcalendar:not(.fc-processed)').addClass('fc-processed').fullCalendar({
    defaultView: Drupal.settings.fullcalendar.defaultView,
    theme: Drupal.settings.fullcalendar.theme,
    header: {
      left: Drupal.settings.fullcalendar.left,
      center: Drupal.settings.fullcalendar.center,
      right: Drupal.settings.fullcalendar.right
    },
    eventClick: function(calEvent, jsEvent, view) {
      if (Drupal.settings.fullcalendar.colorbox) {
      // Open in colorbox if exists, else open in new window.
        if ($.colorbox) {
          $.colorbox({href:calEvent.url, iframe:true, width:'80%', height:'80%'});
        }
      }
      else {
        if (Drupal.settings.fullcalendar.sameWindow) {
          window.location.href = calEvent.url;
        }
        else {
          window.open(calEvent.url);
        }
      }
      return false;
    },
    year: (Drupal.settings.fullcalendar.year) ? Drupal.settings.fullcalendar.year : undefined,
    month: (Drupal.settings.fullcalendar.month) ? Drupal.settings.fullcalendar.month : undefined,
    day: (Drupal.settings.fullcalendar.day) ? Drupal.settings.fullcalendar.day : undefined,
    timeFormat: {
      agenda: (Drupal.settings.fullcalendar.clock) ? 'HH:mm{ - HH:mm}' : Drupal.settings.fullcalendar.agenda,
      '': (Drupal.settings.fullcalendar.clock) ? 'HH:mm' : 'h(:mm)t'
    },
    axisFormat: (Drupal.settings.fullcalendar.clock) ? 'HH:mm' : 'h(:mm)tt',
    weekMode: Drupal.settings.fullcalendar.weekMode,
    firstDay: Drupal.settings.fullcalendar.firstDay,
    monthNames: Drupal.settings.fullcalendar.monthNames,
    monthNamesShort: Drupal.settings.fullcalendar.monthNamesShort,
    dayNames: Drupal.settings.fullcalendar.dayNames,
    dayNamesShort: Drupal.settings.fullcalendar.dayNamesShort,
    allDayText: Drupal.settings.fullcalendar.allDayText,
    buttonText: {
      today:  Drupal.settings.fullcalendar.todayString,
      day: Drupal.settings.fullcalendar.dayString,
      week: Drupal.settings.fullcalendar.weekString,
      month: Drupal.settings.fullcalendar.monthString
    },
    events: function(start, end, callback) {
      // Load events from AJAX callback, if set.
      var argattr = "";
      if (window.location.href.indexOf('?') != -1) {
        argattr = window.location.href.slice(window.location.href.indexOf('?'));
      }
      switch($('#fullcalendar').fullCalendar('getView').name) {
        case 'agendaDay':
          if (Drupal.settings.fullcalendar.ajax_callback_day) {
            var argdate = start;
              var argdateStr = argdate.getFullYear() + "-" + (argdate.getMonth()+1) + "-" + (argdate.getDate());
              var eventUrl = Drupal.settings.fullcalendar.ajax_callback_day + '/' + argdateStr + argattr;
          }
          break;  
        case 'agendaWeek':
          if (Drupal.settings.fullcalendar.ajax_callback_week) {
            var argdate = start;
              var argdateStr = argdate.getFullYear() + "-W" + (argdate.getWeek()+1);
              var eventUrl = Drupal.settings.fullcalendar.ajax_callback_week + '/' + argdateStr + argattr;
          } else {
            if (Drupal.settings.fullcalendar.ajax_callback_month) {
                var argdate = new Date((start.getTime()+end.getTime())/2);
                var argdateStr = argdate.getFullYear() + "-" + (argdate.getMonth()+1);
                var eventUrl = Drupal.settings.fullcalendar.ajax_callback_month + '/' + argdateStr + argattr;
            }
          }
          break;
        case 'month':
          if (Drupal.settings.fullcalendar.ajax_callback_month) {
            var argdate = new Date((start.getTime()+end.getTime())/2);
            var argdateStr = argdate.getFullYear() + "-" + (argdate.getMonth()+1);
            var eventUrl = Drupal.settings.fullcalendar.ajax_callback_month + '/' + argdateStr + argattr;
          }
          break;
      }
      if (eventUrl) {
    	  if ($.jCache.getItem(eventUrl)) {
    		callback($.jCache.getItem(eventUrl));
    	  } else {
    		$.ajax({
	          url: eventUrl,
	          dataType: 'json',
	          success: function(events) {
	        	$.jCache.setItem(this.url, events);
	            callback(events);
	          }
	        });  
    	  }
        return;  // Don't load events from page.
      }
      var events = [];

      $('.fullcalendar_event').each(function() {
        $(this).find('.fullcalendar_event_details').each(function() {
          events.push({
            field: $(this).attr('field'),
            index: $(this).attr('index'),
            nid: $(this).attr('nid'),
            title: $(this).attr('title'),
            start: $(this).attr('start'),
            end: $(this).attr('end'),
            url: $(this).attr('href'),
            allDay: ($(this).attr('allDay') === '1'),
            className: $(this).attr('cn'),
            editable: $(this).attr('editable')
          });
          if ($(this).parent().find('.fc-flyout').length) {
            events[events.length-1].flyout = $(this).parent().find('.fc-flyout');
          }
        });
      });

      callback(events);
    },
    eventRender: function( event, element, view ) {
      if (event.flyout) {
        element.append(event.flyout);
      }
    },
    eventDrop: function(event, dayDelta, minuteDelta, allDay, revertFunc) {
      $.post(Drupal.settings.basePath + 'fullcalendar/ajax/update/drop/'+ event.nid,
        'field=' + event.field + '&index=' + event.index + '&day_delta=' + dayDelta + '&minute_delta=' + minuteDelta + '&all_day=' + allDay,
        fullcalendarUpdate);
      return false;
    },
    eventResize: function(event, dayDelta, minuteDelta, revertFunc) {
      $.post(Drupal.settings.basePath + 'fullcalendar/ajax/update/resize/'+ event.nid,
        'field=' + event.field + '&index=' + event.index + '&day_delta=' + dayDelta + '&minute_delta=' + minuteDelta,
        fullcalendarUpdate);
      return false;
    },
    loading: function( isLoading, view ) {
      // Show throbber while working.
      $(this).find('.fc-header-title h2').toggleClass( 'fc-ajaxing', isLoading );
    },
    readyState: function() {
      Drupal.attachBehaviors($('.fc-content'));
      $('.fc-content a.viewmore').unbind('click').click(function(event) {
    	var year = (parseInt($(this).attr('href').substring(1,5), 10));
        var month = (parseInt($(this).attr('href').substring(6,8), 10) - 1);
        var day = (parseInt($(this).attr('href').substring(9,11), 10));
        $('#fullcalendar').fullCalendar('changeView', 'agendaDay');
        $('#fullcalendar').fullCalendar('gotoDate', year, month, day);
        $('#fullcalendar').fullCalendar('refetchEvents');
        event.preventDefault();
      });
    },
  });

  var fullcalendarUpdate = function(response) {
    var result = Drupal.parseJson(response);
    if ($('#fullcalendar-status').text() === '') {
      $('#fullcalendar-status').html(result.msg).slideDown();
    } else {
      $('#fullcalendar-status').html(result.msg).effect('highlight', {}, 5000);
    }
    return false;
  };

  $('.fullcalendar-status-close').live('click', function() {
    $('#fullcalendar-status').slideUp();
    return false;
  });

  //trigger a window resize so that calendar will redraw itself as it loads funny in some browsers occasionally
  $(window).resize();
};

})(jQuery);
