export const DEFAULT_PARAMS = {
  Prev_PWindow_size: 12,
  Prev_AWindow_size: 5,
  Prev_max_pressure: 400,
  Prev_min_pressure: 0,
  dosing_amt_per_trip: 5,
  tank_level_limit: 5,
  flow_pulse: 80,
  flow_factor: 0.5,
  transit_rpm_max: 2,
  transit_rpm_min: 0,
  load_rpm_max: 8,
  load_rpm_min: 3,
  idle_pressure: 5,
  non_idle_pressure: 5,
  idle_time: 300,
  non_zero_time: 600,
  master_pressure_time: 600,
  transit_time: 60,
  dosing_decide_time: 300,
  stop_dosing_time: 10800,
  publish_time: 65,
  dose_time: 8,
  dose_amount: 0.5,
}

export const SLIDER_DEFS = [
  {
    section: 'PRESSURE PROCESSING',
    params: [
      { key: 'Prev_PWindow_size',  label: 'P Window Size',   min: 1,   max: 50,   step: 1   },
      { key: 'Prev_AWindow_size',  label: 'A Window Size',   min: 1,   max: 20,   step: 1   },
      { key: 'Prev_max_pressure',  label: 'Max Pressure',    min: 0,   max: 500,  step: 5   },
      { key: 'Prev_min_pressure',  label: 'Min Pressure',    min: -50, max: 50,   step: 1   },
    ]
  },
  {
    section: 'DOSING PARAMETERS',
    params: [
      { key: 'dosing_amt_per_trip', label: 'Max Dose / Trip (L)', min: 0.5, max: 20, step: 0.5 },
      { key: 'tank_level_limit',    label: 'Tank Level Limit (L)', min: 1,  max: 21, step: 0.5 },
      { key: 'dose_time',           label: 'Dose Time (s)',        min: 1,  max: 60, step: 1   },
      { key: 'dose_amount',         label: 'Dose Amount (L)',      min: 0.1,max: 5,  step: 0.1 },
    ]
  },
  {
    section: 'FLOW CALIBRATION',
    params: [
      { key: 'flow_pulse',  label: 'Flow Pulse',  min: 1,   max: 500, step: 1   },
      { key: 'flow_factor', label: 'Flow Factor', min: 0.1, max: 10,  step: 0.1 },
    ]
  },
  {
    section: 'RPM DETECTION',
    params: [
      { key: 'transit_rpm_min', label: 'Transit RPM Min', min: 0, max: 5,  step: 0.5 },
      { key: 'transit_rpm_max', label: 'Transit RPM Max', min: 0, max: 10, step: 0.5 },
      { key: 'load_rpm_min',    label: 'Load RPM Min',    min: 0, max: 10, step: 0.5 },
      { key: 'load_rpm_max',    label: 'Load RPM Max',    min: 0, max: 20, step: 0.5 },
    ]
  },
  {
    section: 'PRESSURE TRIGGER',
    params: [
      { key: 'idle_pressure',     label: 'Idle Pressure (Bar)',     min: 0, max: 30, step: 0.5 },
      { key: 'non_idle_pressure', label: 'Non-Idle Pressure (Bar)', min: 0, max: 30, step: 0.5 },
    ]
  },
  {
    section: 'TIMING LOGIC',
    params: [
      { key: 'idle_time',            label: 'Idle Time (s)',            min: 10,  max: 3600,  step: 10 },
      { key: 'non_zero_time',        label: 'Non Zero Time (s)',        min: 10,  max: 3600,  step: 10 },
      { key: 'master_pressure_time', label: 'Master Pressure Time (s)', min: 60,  max: 7200,  step: 60 },
      { key: 'transit_time',         label: 'Transit Time (s)',         min: 10,  max: 600,   step: 10 },
      { key: 'dosing_decide_time',   label: 'Dosing Decide Time (s)',   min: 60,  max: 3600,  step: 60 },
      { key: 'stop_dosing_time',     label: 'Stop Dosing Time (s)',     min: 60,  max: 86400, step: 60 },
      { key: 'publish_time',         label: 'Publish Time (s)',         min: 10,  max: 300,   step: 5  },
    ]
  },
]
