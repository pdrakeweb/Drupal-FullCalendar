// $Id$
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
          window.open(calEvent.url, _self);
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
      if (Drupal.settings.fullcalendar.ajax_callback) {
        // TODO: refactor to use "data:" block to pass arg attributes from filters
        var argattr = "";
        if (window.location.href.indexOf('?') != -1) {
          argattr = window.location.href.slice(window.location.href.indexOf('?'));
        }
        var argdate = new Date((start.getTime()+end.getTime())/2);
        var argdateStr = argdate.getFullYear() + "-" + (argdate.getMonth()+1)
        $.ajax({
          url: Drupal.settings.fullcalendar.ajax_callback + '/' + argdateStr + argattr,
          dataType: 'json',
          success: function(events) {
            callback(events);
          }
        });
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
        element.children('a').prepend(event.flyout);
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
      // Show thobber while working.
      $(this).find('h2.fc-header-title').toggleClass( 'fc-ajaxing', isLoading );
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
