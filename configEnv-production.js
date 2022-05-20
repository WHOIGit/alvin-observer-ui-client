// Web socket server root URL
window.WS_SERVER =
  typeof window !== "undefined" && `https://${window.location.hostname}`;

// Web socket server path, ex: "/websocket-server-path/"
window.WS_PATH = "/imaging-control/";

// sealog url for iframe
window.SEALOG_URL =
  typeof window !== "undefined" && `https://${window.location.hostname}/sealog`;

// Video stream server configs
window.VIDEO_STREAM_SERVER =
  typeof window !== "undefined" && `https://${window.location.hostname}/video`;

window.PORT_OBSERVER_VIDEO = "port_obs";
window.PORT_OBSERVER_SMALL_VIDEO = "port_obs_small";
window.PORT_RECORDER_VIDEO = "port_rec";
window.STBD_OBSERVER_VIDEO = "stbd_obs";
window.STBD_OBSERVER_SMALL_VIDEO = "stbd_obs_small";
window.STBD_RECORDER_VIDEO = "stbd_rec";
window.PILOT_VIDEO = "pilot";
window.PILOT_SMALL_VIDEO = "pilot_small";

window.CAMERAS = [
  { camera: "camera1", cam_name: "port_brow_4k", owner: "port" },
  { camera: "camera2", cam_name: "port_patz", owner: "port" },
  { camera: "camera3", cam_name: "stbd_brow_4k", owner: "stbd" },
  { camera: "camera4", cam_name: "stbd_patz", owner: "stbd" },
  { camera: "camera5", cam_name: "aft_cam", owner: "none" },
  { camera: "camera6", cam_name: "down_cam", owner: "none" },
  { camera: "camera7", cam_name: "brow_wide", owner: "none" },
  { camera: "camera8", cam_name: "sci_cam", owner: "pilot" },
  { camera: "camera9", cam_name: "pilot_cam", owner: "pilot" },
];



window.ROUTER_INPUTS = [
  { label: "pilot_cam", value: "input1" },
  { label: "port_flexlink2", value: "input2" },
  { label: "port_patz", value: "input3" },
  { label: "port_brow_4k", value: "input4" },
  { label: "INPUT 5", value: "input5" },
  { label: "INPUT 6", value: "input6" },
  { label: "aft_cam", value: "input7" },
  { label: "img_server_vga", value: "input8" },
  { label: "INPUT 9", value: "input9" },
  { label: "down_cam", value: "input10" },
  { label: "sci_cam", value: "input11" },
  { label: "INPUT 12", value: "input12" },
  { label: "stbd_patz", value: "input13" },
  { label: "stbd_brow_4k", value: "input14" },
  { label: "brow_cam", value: "input15" },
  { label: "stbd_flexlink2", value: "input16" },
];

/*
window.ROUTER_INPUTS = [
  { label: "port_brow_4k", value: "input1" },
  { label: "port_patz", value: "input2" },
  { label: "port_video3", value: "input3" },
  { label: "INPUT 4", value: "input4" },
  { label: "brow_cam", value: "input5" },
  { label: "port_flexlink2", value: "input6" },
  { label: "aft_cam", value: "input7" },
  { label: "img_server_vga", value: "input8" },
  { label: "INPUT 9", value: "input9" },
  { label: "down_cam", value: "input10" },
  { label: "stbd_brow_4k", value: "input11" },
  { label: "stbd_patz", value: "input12" },
  { label: "stbd_video3", value: "input13" },
  { label: "sci_cam", value: "input14" },
  { label: "pilot_cam", value: "input15" },
  { label: "stbd_flexlink2", value: "input16" },
];
*/


/*                   
aja_input_table = {'port_brow_4k'   : 'input1',   
                   'port_patz'      : 'input2', 
                   'port_video3'    : 'input3', 
                   'input4'         : 'input4', 
                   'brow_cam'       : 'input5',  #port_flexlink1
                   'port_flexlink2' : 'input6', 
                   'aft_cam'        : 'input7',  #port-IP-video1 
                   'img_server_vga' : 'input8', 
                   'input9'         : 'input9', 
                   'down_cam'       : 'input10', #stbs-IP-video 
                   'stbd_brow_4k'   : 'input11',
                   'stbd_patz'      : 'input12',
                   'stbd_video3'    : 'input13',
                   'sci_cam'        : 'input14', 
                   'pilot_cam'      : 'input15', #stbd_flexlink1        
                   'stbd_flexlink2' : 'input16'} 
*/                      

window.ROUTER_OUTPUTS = [
  { label: "port_raw_rec", value: "output1" },
  { label: "port_prox_rec", value: "output2" },
  { label: "port_obs_mon", value: "output3" },
  { label: "browcam_fg", value: "output4" },
  { label: "OUTPUT 5", value: "output5" },
  { label: "OUTPUT 6", value: "output6" },
  { label: "pilot_mon", value: "output7" },
  { label: "OUTPUT 8", value: "output8" },
  { label: "OUTPUT 9", value: "output9" },
  { label: "OUTPUT 10", value: "output10" },
  { label: "stbd_raw_rec", value: "output11" },
  { label: "stbd_prox_rec", value: "output12" },
  { label: "stbd_obs_mon", value: "output13" },
  { label: "OUTPUT 14", value: "output14" },
  { label: "browcam_video", value: "output15" },
  { label: "scicam_video", value: "output16" },
];  
  
/*
aja_output_table = {'port_prores_rec'  : 'output1', #port_video1  
                    'port_proxy_rec'   : 'output2', #port_video2
                    'port_obs_mon'     : 'output3', #port_video3
                    'browcam_fg_video' : 'output4', 
                    'output5'          : 'output5', 
                    'output6'          : 'output6', 
                    'pilot_mon'        : 'output7', 
                    'output8'          : 'output8', 
                    'output9'          : 'output9', 
                    'output10'         : 'output10', 
                    'stbd_prores_rec'  : 'output11', #Stbd_video1
                    'stbd_proxy_rec'   : 'output12', #Stbd_video2 
                    'stbd_obs_mon'     : 'output13', #Stbd_video3
                    'output14'         : 'output14', 
                    'browcam_video'    : 'output15', #Browcam Av.IO          
                    'scicam_video'     : 'output16'} #Scicam Av.IO  
*/
