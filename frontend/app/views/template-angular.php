<?php
        /*
                Template Name: Angular
        */
?>
<?php
add_action( 'wp_enqueue_scripts', 'load_angular_javascript' );
function load_angular_javascript()
{
    
   wp_enqueue_script('jquery-js', plugins_url() . "/angular/bower_components/jquery/jquery.js");
   wp_enqueue_script('d3-js', plugins_url() . "/angular/bower_components/d3/d3.js");
   wp_enqueue_script('moment-js', plugins_url() . "/angular/bower_components/moment/moment.js");
   wp_enqueue_script('underscore-js', plugins_url() . "/angular/bower_components/underscore/underscore.js");
   wp_enqueue_script('nv.d3-js', plugins_url() . "/angular/bower_components/nvd3/nv.d3.js");
   wp_enqueue_script('angular-js', plugins_url() . "/angular/bower_components/angular/angular.js");

    /* build:js scripts/modules.js */
   wp_enqueue_script('angular-animate-js', plugins_url() . "/angular/bower_components/angular-animate/angular-animate.min.js");
   wp_enqueue_script('ui-bootstrap-js', plugins_url() . "/angular/bower_components/angular-bootstrap/ui-bootstrap.min.js");
   wp_enqueue_script('angular-route-js', plugins_url() . "/angular/bower_components/angular-route/angular-route.js");
   wp_enqueue_script('angular-resource-js', plugins_url() . "/angular/bower_components/angular-resource/angular-resource.js");
   wp_enqueue_script('angular-cookies-js', plugins_url() . "/angular/bower_components/angular-cookies/angular-cookies.js");
   wp_enqueue_script('angular-sanitizejs', plugins_url() . "/angular/bower_components/angular-sanitize/angular-sanitize.js");
   wp_enqueue_script('angularjs-nvd3-directives-js', plugins_url() . "/angular/bower_components/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js");
   wp_enqueue_script('timeline-js', plugins_url() . "/angular/bower_components/TimelineJS/build/js/storyjs-embed.js");
    /* endbuild */

    /* build:js({.tmp,app}) scripts/scripts.js */
   wp_enqueue_script('app-js', plugins_url() . "/angular/scripts/app.js");
   wp_enqueue_script('utils-js', plugins_url() . "/angular/scripts/utils.js");
   wp_enqueue_script('underscore-extensions-js', plugins_url() . "/angular/scripts/underscore-extensions.js");
   wp_enqueue_script('main-js', plugins_url() . "/angular/scripts/controllers/main.js");
   wp_enqueue_script('budgets-js', plugins_url() . "/angular/scripts/controllers/budgets.js");
   wp_enqueue_script('resources-js', plugins_url() . "/angular/scripts/services/resources.js");
   wp_enqueue_script('budget-timeline-js', plugins_url() . "/angular/scripts/directives/budget-timeline.js");

 
}
?>

<?php get_header(); ?> 

<div ng-app="pippDataApp" id="site-body-wrapper" class="clearfix">
  <div id="site-body" class="content-width bfont single-page">

      <?php while ( have_posts() ) : the_post(); ?>
                      <article <?php post_class('clearfix content-effect-wrapper '.get_option('ce_content_effect')); ?>>
        
                                <div class="entry-wrapper clearfix content-effect">
        
                                        <div class="entry-header-wrapper">
                                        <div class="entry-header content-inner-width">
                                                <h1 class="entry-title">
                                                        <?php the_title(); ?>
                                                </h1>
                                                <span class="entry-title-decoration"></span>
                                        </div>
                                </div>
                
                                        <?php get_template_part( 'content/content', 'image' ); ?>
                
                                        <div class="entry-content-wrapper">
                                                <div class="entry-content content-inner-width clearfix">                        
                                                        <?php the_content(); ?>
                                                </div>
                                        </div>
                                        
                                        <div class="entry-footer-wrapper">
                                                <div class="entry-footer content-inner-width">
                                                        <span class="entry-footer-decoration"></span>                   
                                                </div>
                                        </div>
                                
                                </div>
                                
                        </article>

      <?php endwhile; ?>

  </div>
</div>            
<?php get_footer(); ?>
~                                                                                                                                         
~                                                 