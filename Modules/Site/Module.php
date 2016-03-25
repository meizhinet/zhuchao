<?php
/**
 * Cntysoft Cloud Software Team
 *
 * @author SOFTBOY <cntysoft@163.com>
 * @copyright  Copyright (c) 2010-2011 Cntysoft Technologies China Inc. <http://www.cntysoft.com>
 * @license    http://www.cntysoft.com/license/new-bsd     New BSD License
 */
namespace Site;
use Phalcon\Mvc\ModuleDefinitionInterface;
use Cntysoft\Kernel;
use App\ZhuChao\Provider\Acl;
use App\ZhuChao\Buyer\Acl as BuyerAcl;
/**
 * 前端模块初始化代码
 */
class Module implements ModuleDefinitionInterface
{
   /**
    * Registers an autoloader related to the module
    *
    * @param \Phalcon\DiInterface $dependencyInjector
    */
   public function registerAutoloaders(\Phalcon\DiInterface $dependencyInjector = null)
   {
      $di = Kernel\get_global_di();
      $loader = $di->getShared('loader');
      $loader->registerNamespaces(array(
         'SiteFrontApi' => __DIR__ . DS . 'FrontApi'
              ), true);
      $loader->registerDirs(array(
         __DIR__ . DS . 'Controllers'
      ))->register();
   }

   /**
    * Registers services related to the module
    *
    * @param \Phalcon\DiInterface $dependencyInjector
    */
   public function registerServices(\Phalcon\DiInterface $dependencyInjector)
   {
      $acl = new BuyerAcl();
      $dependencyInjector->set('BuyerAcl', function()use($acl) {
         return $acl;
      });
   }

}