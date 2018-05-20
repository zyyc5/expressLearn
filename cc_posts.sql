/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 80011
Source Host           : localhost:3306
Source Database       : express

Target Server Type    : MYSQL
Target Server Version : 80011
File Encoding         : 65001

Date: 2018-05-20 21:52:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for cc_posts
-- ----------------------------
DROP TABLE IF EXISTS `cc_posts`;
CREATE TABLE `cc_posts` (
  `id` int(11) NOT NULL,
  `cat_id` int(11) DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `content` text,
  `sort_index` int(11) DEFAULT '0',
  `is_del` tinyint(4) DEFAULT '0',
  `image` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `cdate` int(10) DEFAULT '0',
  `update_date` int(10) DEFAULT '0',
  `post_date` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of cc_posts
-- ----------------------------

-- ----------------------------
-- Table structure for cc_posts_cat
-- ----------------------------
DROP TABLE IF EXISTS `cc_posts_cat`;
CREATE TABLE `cc_posts_cat` (
  `cat_id` int(11) NOT NULL AUTO_INCREMENT,
  `cat_name` varchar(255) DEFAULT NULL,
  `show_type` int(10) DEFAULT NULL,
  PRIMARY KEY (`cat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of cc_posts_cat
-- ----------------------------
INSERT INTO `cc_posts_cat` VALUES ('1', '产品中心', '1');
INSERT INTO `cc_posts_cat` VALUES ('2', '案例展示', '2');
INSERT INTO `cc_posts_cat` VALUES ('3', '新闻中心', '3');
