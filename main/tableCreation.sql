/*

#blacklistedtable
	
	CREATE TABLE arc_ald_n783qv (
	 malicious_i_p bigint(20) DEFAULT NULL,
	 malicious_domain varchar(1000) COLLATE utf8_bin DEFAULT NULL,
	 message varchar(1000) COLLATE utf8_bin DEFAULT NULL,
	 creation_time datetime(3) NOT NULL,
	 last_modified_time datetime(3) NOT NULL,
	 count int(11) NOT NULL,
	 hash_code bigint(20) NOT NULL,
	 KEY ARC_ALD_N783QV_main (malicious_i_p),
	 KEY ARC_ALD_N783QV_hashIndex (hash_code)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
	
	#publictablecreation
	CREATE TABLE arc_ald_6idppj (
	  source_address bigint(20) DEFAULT NULL,
	  destination_address bigint(20) DEFAULT NULL,
	  port int(11) DEFAULT NULL,
	  creation_time datetime(3) NOT NULL,
	  last_modified_time datetime(3) NOT NULL,
	  count int(11) NOT NULL,
	  hash_code bigint(20) NOT NULL,
	  KEY ARC_ALD_6IDPPJ_main (source_address,destination_address,port),
	  KEY ARC_ALD_6IDPPJ_hashIndex (hash_code)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin
	
	*/
	
	#blacklistedtable
	
	CREATE TABLE arc_ald_n783qv (
	 id int NOT NULL AUTO_INCREMENT primary key,
	 malicious_i_p bigint(20) DEFAULT NULL,
	 malicious_domain varchar(1000) COLLATE utf8_bin DEFAULT NULL,
	 message varchar(1000) COLLATE utf8_bin DEFAULT NULL,
	 creation_time datetime(3) NOT NULL,
	 last_modified_time datetime(3) NOT NULL,
	 count int(11) NOT NULL,
	 hash_code bigint(20) NOT NULL,
	 KEY ARC_ALD_N783QV_main (malicious_i_p),
	 KEY ARC_ALD_N783QV_hashIndex (hash_code)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
	
	#publictablecreation
	CREATE TABLE arc_ald_6idppj (
	  id int NOT NULL AUTO_INCREMENT primary key,
	  source_address bigint(20) DEFAULT NULL,
	  destination_address bigint(20) DEFAULT NULL,
	  port int(11) DEFAULT NULL,
	  creation_time datetime(3) NOT NULL,
	  last_modified_time datetime(3) NOT NULL,
	  count int(11) NOT NULL,
	  hash_code bigint(20) NOT NULL,
	  KEY ARC_ALD_6IDPPJ_main (source_address,destination_address,port),
	  KEY ARC_ALD_6IDPPJ_hashIndex (hash_code)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin