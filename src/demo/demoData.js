export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export const DEMO_PROFILE = {
  id: 'demo-manager',
  full_name: 'Demo Manager',
  role: 'manager',
  department: 'HSE Operations',
  job_title: 'Safety Manager',
};

const reporters = [
  { full_name: 'Jordan Lee', department: 'Manufacturing', job_title: 'Process Operator' },
  { full_name: 'Taylor Morgan', department: 'Warehouse', job_title: 'Material Handler' },
  { full_name: 'Casey Rivera', department: 'Engineering', job_title: 'Maintenance Engineer' },
];

export const DEMO_INCIDENTS = [
  { id:'demo-01', reference_number:'SG-2026-1042', incident_type:'Near Miss', status:'manager_review', overall_risk:'High', created_at:'2026-10-10T08:20:00Z', incident_at:'2026-10-10T08:05:00Z', location_label:'Packaging Hall · Line 4', description:'Unsecured pallet shifted during transfer.', capa_action:'Introduce pre-shift pallet inspections and refresh handling guidance.', capa_status:'in_progress', capa_due_date:'2026-10-20', updated_at:'2026-10-11T09:00:00Z', reporter:reporters[0], capa_owner_profile:{ full_name:'Morgan Patel', job_title:'Shift Supervisor' } },
  { id:'demo-02', reference_number:'SG-2026-1041', incident_type:'Potential', status:'manager_review', overall_risk:'Medium', created_at:'2026-10-08T10:30:00Z', incident_at:'2026-10-08T10:15:00Z', location_label:'Utilities · Boiler Room', description:'Steam-line insulation showed visible wear.', capa_action:'Replace damaged insulation and add it to the monthly inspection route.', capa_status:'pending', capa_due_date:'2026-10-18', updated_at:'2026-10-09T13:00:00Z', reporter:reporters[2], capa_owner_profile:{ full_name:'Alex Kim', job_title:'Maintenance Lead' } },
  { id:'demo-03', reference_number:'SG-2026-1040', incident_type:'Actual', status:'under_investigation', overall_risk:'High', created_at:'2026-10-05T06:45:00Z', incident_at:'2026-10-05T06:30:00Z', location_label:'Warehouse · Bay 2', description:'Forklift contacted a storage rack guard.', capa_action:'Repaint travel lanes and install proximity mirrors at the blind corner.', capa_status:'pending', capa_due_date:'2026-10-15', updated_at:'2026-10-06T11:00:00Z', reporter:reporters[1], capa_owner_profile:{ full_name:'Sam Wilson', job_title:'Warehouse Lead' } },
  { id:'demo-04', reference_number:'SG-2026-1039', incident_type:'Near Miss', status:'reported', overall_risk:'Medium', created_at:'2026-10-03T14:10:00Z', incident_at:'2026-10-03T14:00:00Z', location_label:'Quality Lab · Entry', description:'Temporary cable crossed a pedestrian walkway.', updated_at:'2026-10-03T14:10:00Z', reporter:reporters[0] },
  { id:'demo-05', reference_number:'SG-2026-1038', incident_type:'Potential', status:'under_investigation', overall_risk:'Low', created_at:'2026-09-28T09:20:00Z', incident_at:'2026-09-28T09:05:00Z', location_label:'Engineering Workshop', description:'Tool cabinet latch did not close completely.', updated_at:'2026-09-29T07:00:00Z', reporter:reporters[2] },
  { id:'demo-06', reference_number:'SG-2026-1037', incident_type:'Actual', status:'closed', overall_risk:'Medium', created_at:'2026-09-23T12:00:00Z', incident_at:'2026-09-23T11:40:00Z', closed_at:'2026-10-02T12:00:00Z', location_label:'Warehouse · Dispatch', description:'Minor package damage during loading.', capa_action:'Update loading checklist and verify dock-plate alignment.', capa_status:'completed', capa_due_date:'2026-10-01', updated_at:'2026-10-02T12:00:00Z', reporter:reporters[1], capa_owner_profile:{ full_name:'Sam Wilson', job_title:'Warehouse Lead' } },
  { id:'demo-07', reference_number:'SG-2026-1036', incident_type:'Near Miss', status:'closed', overall_risk:'Low', created_at:'2026-09-18T07:15:00Z', incident_at:'2026-09-18T07:00:00Z', closed_at:'2026-09-25T15:00:00Z', location_label:'Manufacturing · Line 2', description:'Guarding inspection identified a loose fastener.', updated_at:'2026-09-25T15:00:00Z', reporter:reporters[0] },
  { id:'demo-08', reference_number:'SG-2026-1035', incident_type:'Potential', status:'closed', overall_risk:'Medium', created_at:'2026-08-27T16:20:00Z', incident_at:'2026-08-27T16:10:00Z', closed_at:'2026-09-04T10:00:00Z', location_label:'Utilities · Pump Room', description:'Small leak detected during routine inspection.', updated_at:'2026-09-04T10:00:00Z', reporter:reporters[2] },
  { id:'demo-09', reference_number:'SG-2026-1034', incident_type:'Near Miss', status:'closed', overall_risk:'Low', created_at:'2026-08-11T05:50:00Z', incident_at:'2026-08-11T05:40:00Z', closed_at:'2026-08-19T09:00:00Z', location_label:'Warehouse · Aisle 6', description:'Empty carton obstructed a marked route.', updated_at:'2026-08-19T09:00:00Z', reporter:reporters[1] },
];

export const DEMO_SAFETY_POINTS = [
  { points: 140, profiles: { department: 'Manufacturing' } },
  { points: 115, profiles: { department: 'Engineering' } },
  { points: 90, profiles: { department: 'Warehouse' } },
  { points: 55, profiles: { department: 'Quality' } },
];
