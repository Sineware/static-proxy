<?php
/*
 * Plugin Name:       Sineware Static Proxy Integration
 * Plugin URI:        https://github.com/Sineware/static-proxy
 * Description:       Calls the Static Proxy refresh endpoint when the WordPress site is updated.
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            Seshan Ravikumar
 * Author URI:        https://sineware.ca/
 * License:           AGPL v3 or later
 * License URI:       https://www.gnu.org/licenses/agpl-3.0.html
 * Update URI:        https://github.com/Sineware/static-proxy
 */
function swsp_refresh() {
    $url = get_option( 'swsp_post_url' );
    $api_key = get_option( 'swsp_api_key' );
    $response = wp_remote_post( $url, array(
        'method'      => 'POST',
        'headers' => array(
            'Authorization' => 'Bearer ' . $api_key
        )
    ));
}
add_action( 'save_post', 'swsp_refresh' );


/* --- Admin Page --- */
function swsp_admin_menu() {
    add_options_page( 'Sineware Static Proxy', 'Sineware Static Proxy', 'manage_options', 'swsp', 'swsp_options_page' );
}
add_action( 'admin_menu', 'swsp_admin_menu' );

function swsp_options_page() {
    ?>
    <div>
        <h2>Sineware Static Proxy</h2>
        <p>Settings:</p>
        <form action="options.php" method="post">
            <?php settings_fields( 'swsp_options' ); ?>
            <?php do_settings_sections( 'swsp' ); ?>
            <input name="Submit" type="submit" value="<?php esc_attr_e( 'Save' ); ?>" />
        </form>
    </div>
    <?php
}

/* --- Settings --- */
// POST url
function swsp_register_settings() {
    add_option( 'swsp_post_url', '' );
    register_setting( 'swsp_options', 'swsp_post_url' );
}
add_action( 'admin_init', 'swsp_register_settings' );
