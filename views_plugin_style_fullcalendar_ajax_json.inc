<?php

// require_once(drupal_get_path('module', 'views_ajax_endpoint') . '/views_plugin_style_ajax.inc');

class views_plugin_style_fullcalendar_ajax_json extends views_plugin_style {
  /**
   * Set default options.
   */
  function option_definition() {
    $options = parent::option_definition();
    
    return $options;
  }

  /**
   * Extend the options form.
   */
  function options_form(&$form, &$form_state) {
    parent::options_form($form, $form_state);
    // Style types
    $fields = array(0 => '<'. t('None') .'>');
    foreach ($this->view->display_handler->get_option('fields') as $field => $definition) {
      $fields[$field] = !empty($definition['label']) ? $definition['label'] : $field;
    }
    $form['field'] = array(
      '#title' => t('Field'),
      '#description' => t('Choose a field to be used for field updates.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['field'],
    );
    $form['index'] = array(
      '#title' => t('index'),
      '#description' => t('Choose a field to be used for index (delta) items.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['index'],
    );
    $form['nid'] = array(
      '#title' => t('nid'),
      '#description' => t('Choose a field to be used for the nid.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['nid'],
    );
    $form['title'] = array(
      '#title' => t('title'),
      '#description' => t('Choose a field to be used for the title.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['title'],
    );
    $form['start'] = array(
      '#title' => t('start'),
      '#description' => t('Choose a field to be used for start date.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['start'],
    );
    $form['end'] = array(
      '#title' => t('end'),
      '#description' => t('Choose a field to be used for end date.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['end'],
    );
    $form['url'] = array(
      '#title' => t('url'),
      '#description' => t('Choose a field to be used for the URL.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['url'],
    );
    $form['allDay'] = array(
      '#title' => t('allDay'),
      '#description' => t('Choose a field to be used for the allDay status.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['allDay'],
    );
    $form['className'] = array(
      '#title' => t('className'),
      '#description' => t('Choose a field to be used for the className.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['className'],
    );
    $form['editable'] = array(
      '#title' => t('editable'),
      '#description' => t('Choose a field to be used for edit status of the item.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['editable'],
    );
    $form['description'] = array(
      '#title' => t('description'),
      '#description' => t('Choose a field to be used for the description of the item.'),
      '#type' => 'select',
      '#options' => $fields,
      '#default_value' => $this->options['description'],
    );
    $form['daily_limit'] = array(
      '#type' => 'textfield',
      '#title' => t('Daily Event Limit'),
      '#default_value' => $this->options['daily_limit'],
      '#description' => t("(Advanced) Limit the number of events per day which will be returned."),
    );
  }

  function render() {
    $output = parent::render();
    drupal_set_header('Content-type: text/javascript; charset=utf-8');
    $jsonoutput = array();
    if (!empty($this->options['daily_limit'])) {
      $n = array();
      $k = $this->options['daily_limit'];
    }
    foreach ($this->rendered_fields as $field) {
      $structure = array();
      $include_event = true;
      foreach ($this->options as $key => $value) {
        if (!is_null($value) && $value && ($value != "0")) {
          $structure[$key] = $field[$value];
        }
        if ($key == 'recurring') {
          $structure[$key] = FALSE;
        }
        if ($key == 'allDay') {
          $structure[$key] = FALSE;
        }
        if ($key == 'className') {
          $structure[$key] = 'crayon crayon-' . theme('seed_crayon', $field[$value]);
        }
        if ($key == 'field') {
          $structure[$key] = "field_date";
        }
        if ($key == 'start') {
          $structure[$key] = array_pop(explode(' ', strip_tags($field[$value])));
          if (!empty($k) && $n[substr($structure[$key],0,10)]++ > $k) {
            $include_event = false;
            break;
          } elseif (!empty($k) && $n[substr($structure[$key],0,10)] == $k) {
            $structure['title'] = 'View More Events';
            $structure['url'] = '#'.$structure[$key];
            $structure['className'] = 'viewmore crayon crayon-5';
            $structure['start'] = substr($structure[$key],0,10).'T24:00';
            $structure['flyout'] = false;
            break;
          }
        }
        if ($key == 'end') {
          $structure[$key] = array_shift(explode(' ', strip_tags($field[$value])));
        }
      }
      if ($include_event) {
        // Add unexcluded rendered fields to flyout.  This is should be in a seperate theme func.
        // @todo - This doesn't work, but it feels right. :)
        //$structure['flyout'] = theme(array('views_view_fields'), $this->view, $this->options, $row, 'nid');
        if (!isset($structure['flyout'])) {
          $structure['flyout'] = '<span class="crayon-popup"><span class="crayon-popup-label">';
          foreach ($this->display->display_options['fields'] as $field_name => $options) {
            if (empty($options['exclude'])) {
              $structure['flyout'] .= '<div>' . $field[$field_name] . '</div>';
            }
          }
          if (spaces_access_admin()) {
            $structure['flyout'] .= l('Edit', 'node/' . $field['nid'] . '/edit/nojs', array('attributes' => array('class' => 'ctools-use-modal')));
          }
          $structure['flyout'] .= '</span></span>';
        }
        $jsonoutput[] = $structure;
      }
    }
    return drupal_to_js($jsonoutput);
  }
}
