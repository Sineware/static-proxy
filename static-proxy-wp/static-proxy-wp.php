<?php
/*
 * Plugin Name:       Sineware Static Proxy Integration
 * Plugin URI:        https://github.com/Sineware/static-proxy
 * Description:       Calls the Static Proxy refresh endpoint when the WordPress site is updated.
 * Version:           1.1.2
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
add_action( 'delete_post', 'swsp_refresh' );
add_action( 'activated_plugin', 'swsp_refresh' );
add_action( 'deactivated_plugin', 'swsp_refresh' );
add_action( 'switch_theme', 'swsp_refresh' );
add_action( 'customize_save', 'swsp_refresh' );
add_action( 'wp_update_nav_menu', 'swsp_refresh' );

/* --- Admin Page --- */
function swsp_admin_menu() {
    add_options_page( 'Sineware Static Proxy', 'Sineware Static Proxy', 'manage_options', 'swsp', 'swsp_options_page' );
}
add_action( 'admin_menu', 'swsp_admin_menu' );

function swsp_options_page() {
    ?>
    <div>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
        <style>
            .loadingspinner {
                pointer-events: none;
                width: 1.5em;
                height: 1.5em;
                border: 0.4em solid transparent;
                border-color: #eee;
                border-top-color: #3E67EC;
                border-radius: 50%;
                animation: loadingspin 1s linear infinite;
            }

            @keyframes loadingspin {
                100% {
                        transform: rotate(360deg)
                }
            }
        </style>
        <?php screen_icon(); ?>
        <h2>Sineware Static Proxy</h2>
        <form method="post" action="options.php">
            <?php settings_fields( 'swsp_options_group' ); ?>
            <p>Wordpress Integration Settings</p>
            <table>
                <tr valign="top">
                    <th scope="row"><label for="swsp_post_url">Post URL</label></th>
                    <td><input type="text" id="swsp_post_url" name="swsp_post_url" value="<?php echo get_option('swsp_post_url'); ?>" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row"><label for="swsp_api_key">API Key</label></th>
                    <td><input type="text" id="swsp_api_key" name="swsp_api_key" value="<?php echo get_option('swsp_api_key'); ?>" /></td>
                </tr>
            </table>
            <?php  submit_button(); ?>
        </form>
        <hr />
        <!-- button that uses JS to send a POST request to the refresh endpoint -->
        <button class="button button-secondary" id="refresh-btn" onclick="swsp_refresh()">Refresh Proxy Cache</button>
        <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
        <script>
            async function swsp_refresh() {
                try {
                    document.getElementById("refresh-btn").innerHTML = '<div class="loadingspinner"></div>';
                    const response = await fetch("<?php echo get_option( 'swsp_post_url' ); ?>",
                        {
                            method: "POST",
                            headers: {
                                "Authorization": "Bearer " + "<?php echo get_option( 'swsp_api_key' ); ?>"
                            }
                        }
                    );
                    const msg = await response.json();
                    console.log(response);
                    console.log(msg);
                    if(response.ok) {
                        Toastify({
                            text: `Successfully refreshed proxy cache: ${msg.message}`,
                            duration: 3000,
                            close: true,
                            gravity: "top",
                            position: "right",
                            stopOnFocus: true,
                            style: {
                                background: "linear-gradient(to right, #00b09b, #96c93d)",
                            },
                            onClick: function(){}
                        }).showToast();
                        document.getElementById("refresh-btn").innerHTML = "Refresh Proxy Cache";
                    } else {
                        alert("Error: " + response.status);
                        document.getElementById("refresh-btn").innerHTML = "Refresh Proxy Cache";
                    }
                } catch(e) {
                    console.error(e);
                    alert("Error: " + e.message);
                }
                
            }
        </script>
    </div>
    <?php
}

/* --- Settings --- */
// POST url
function swsp_register_settings() {
    add_option( 'swsp_post_url', 'https://example.com/sw-api/refresh' );
    add_option( 'swsp_api_key', 'abc123' );
    register_setting( 'swsp_options_group', 'swsp_post_url', 'swsp_callback' );
    register_setting( 'swsp_options_group', 'swsp_api_key', 'swsp_callback' );
}
add_action( 'admin_init', 'swsp_register_settings' );
