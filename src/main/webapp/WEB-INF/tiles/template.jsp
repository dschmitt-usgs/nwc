<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<!DOCTYPE HTML>
<%!    private static final Logger log = LoggerFactory.getLogger("index.jsp");
    protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

    {
        try {
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            log.error("Could not find JNDI");
        }
    }
    boolean development = Boolean.parseBoolean(props.getProperty("nwc.development"));
%>

<%@ taglib prefix="tiles" uri="http://tiles.apache.org/tags-tiles"%>

<html>
	<head>
		<tiles:insertAttribute name="meta" />
                <script type="text/javascript">
                    (function(){
                        window.CONFIG = {};
                        CONFIG.endpoint = {};
                        CONFIG.endpoint.geoserver = '<%= props.getProperty("nwc.endpoint.geoserver", "http://cida-wiwsc-wsdev.er.usgs.gov:8081/geoserver/")%>';
                        CONFIG.endpoint.thredds = '<%= props.getProperty("nwc.endpoint.thredds", "http://cida-wiwsc-wsqa.er.usgs.gov:8081/thredds/sos/watersmart/sos/watersmart/")%>';
                        
                    }());
                </script>
                        
	</head>
	<body>
		<div class="container site_body_content">
			<div class="row">
				<div id="site_header" class="col-xs-12">
					<tiles:insertAttribute name="header" />
				</div>
			</div>
			<div class="row">
				<div id="site_nav" class="col-xs-12">
					<tiles:insertAttribute name="nav" />
				</div>
			</div>
			<div class="row site_body_content">
				<div id="site_content" class="col-xs-12">
					<tiles:insertAttribute name="body" />
				</div>
			</div>
		</div>
		
		<!--	<div id="site_footer" class="navbar-fixed-bottom"> -->
		<div id="site_footer" class="">
			<tiles:insertAttribute name="footer" />
 		</div>
	</body>
</html>
