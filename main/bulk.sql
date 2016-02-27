create table soc_ipct.vpn_bulk (
 id integer auto_increment primary key,
 `last_modified_time` datetime DEFAULT NULL,
 `hash_code` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
 `ip_from` varchar(20) CHARACTER SET utf8 DEFAULT NULL,
 `ip_to` varchar(20) CHARACTER SET utf8 DEFAULT NULL,
 `country_code` varchar(10) CHARACTER SET utf8 DEFAULT NULL,
 `region_name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
 `zip_code` varchar(20) CHARACTER SET utf8 DEFAULT NULL,
 `time_zone` varchar(10) CHARACTER SET utf8 DEFAULT NULL
) select `UserName` as user_name,`ipAddess` as i_paddress,`listStatus` as status,`creationTime` as creation_time ,`attackCount` as count ,`latitude`,`longitude`,`city` as city_name,`country` as country_name,`ImagePath` as image_path from soc_dashboarddb.vpn;





create table soc_ipct.vulnerabilty_bulk (
 id integer auto_increment primary key
) SELECT `TIMESTAMP` as timeStamp, `CATEGORY` as Category_Type, `VUL_NAME` as Vul_Name, `ATTACKERADDRESS` as attackerAddress, `IPADDRESS` as i_paddress, `ACTION` as deviceAction, `DEVICEHOSTNAME` as deviceHostname, `LOCATION` as DevLocation, `SUMAGG` as SUM_aggregatedEventCount FROM soc_dashboarddb.`vulnerabilty`;